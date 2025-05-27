
//=============================================================================
// Conditional Choices
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Automatically joins adjacent [Show Choices...] commands into a single list of choices.
 * @author Pwino
 * @url https://github.com/aabarcam/RM_MoreChoices
 *
 * @help MoreChoices
 *
 * This plugin automatically joins an unlimited amount of adjacent 
 * [Show Choices...] commands into a single list of choices we 
 * will refer to as a [More Choices] block in game.
 *
 * Use it in the following procedure.
 * Place two or more [Show Choices...] commands one right after the other, 
 * they will be automatically joined into a single [More Choices] in game.
 * Disable this behavior by placing any other command in between 
 * two [Show Choices...] commands at the same indentation level, 
 * such as an empty comment.
 * 
 * As for the [Show Choices...] optional parameters:
 * - Background: The behavior of the [More Choices] defaults to 
 *               that of the first [Show Choices...] command.
 * - Window Position: The behavior of the [More Choices] defaults to 
 *                    that of the first [Show Choices...] command.
 * - Default: The behavior of the [More Choices] defaults to that of the 
 *            first [Show Choices...] command, ignoring those set to None.
 *            Set all [Show Choices...] commands as None to set the
 *            [More Choices] behavior to None.
 * - Branch: The behavior of the [More Choices] defaults to that of the 
 *           first [Show Choices...] command that is set to Branch.
 *           If no commands are set to Branch, the behavior defaults to that of 
 *           the first [Show Choices...] command, ignoring those set to Disallow.
 *           Set all [Show Choices...] commands as Disallow to set the
 *           [More Choices] behavior to Disallow.
 *
 */

//-----------------------------------------------------------------------------

(() => {
    'use strict';

    const od = "<disable>";
    const cd = "</disable>";
    const oh = "<hide>";
    const ch = "</hide>";


    // Fix window size
    let _Window_UpdatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function () {
        const _GameMsg_Choices = $gameMessage.choices;
        const originalChoices = $gameMessage.choices();
        $gameMessage.choices = function () {return previewChoicesState(originalChoices.clone())}
        _Window_UpdatePlacement.call(this);
        $gameMessage.choices = _GameMsg_Choices; // restore choices
    };

    let _Window_MakeCommandList = Window_ChoiceList.prototype.makeCommandList;
    Window_ChoiceList.prototype.makeCommandList = function () {
        _Window_MakeCommandList.call(this);
        const updatedChoices = updateChoicesState(this._list.clone());
        this._list = updatedChoices;
    };

    // Parse conditions
    function updateChoicesState(lst) {
        const del = [];
        for (let index = 0; index < lst.length; index++) {
            const choice = lst[index];
            const choiceObj = new Choice(choice.name);
            choiceObj.run();
            lst[index].enabled = !choiceObj.disabled;
            lst[index].name = choiceObj.text;
            if (choiceObj.hidden) del.push(index);
        }

        for (const el of del.reverse()) {
            lst.splice(el, 1);
        }
        return lst;
    };

    function previewChoicesState(lst) {
        const del = [];
        for (let index = 0; index < lst.length; index++) {
            const choice = lst[index];
            const choiceObj = new Choice(choice);
            choiceObj.run();
            lst[index] = choiceObj.text;
            if (choiceObj.hidden) del.push(index);
        }

        for (const el of del.reverse()) {
            lst.splice(el, 1);
        }
        return lst;
    }

    // Set transparency of disabled choices
    let _Window_DrawItem = Window_ChoiceList.prototype.drawItem;
    Window_ChoiceList.prototype.drawItem = function (index) {
        this.changePaintOpacity(this.isCommandEnabled(index));
        _Window_DrawItem.call(this, index);
    };


    //-----------------------------------------------------------------------------
    // Choice
    //
    // Class of a single choice.

    function Choice() {
        this.initialize(...arguments);
    };

    Choice.prototype.initialize = function (text) {
        this.text = text;
        this.disabled = false;
        this.hidden = false;
    };

    Choice.prototype.parseAll = function () {
        let dPositionStart = -1;
        let dPositionEnd = -1;
        if (this.text.includes(od) && this.text.includes(cd)) {
            dPositionStart = this.text.indexOf(od, 0);
            dPositionEnd = this.text.indexOf(cd, dPositionStart + 1);
            const dExprRaw = this.text.slice(dPositionStart + od.length, dPositionEnd);
            this.disableExpr = new Expr(this.parse(dExprRaw));
        }
        let hPositionStart = -1;
        let hPositionEnd = -1;
        if (this.text.includes(oh) && this.text.includes(ch)) {
            hPositionStart = this.text.indexOf(oh, 0);
            hPositionEnd = this.text.indexOf(ch, hPositionStart + 1);
            const hExprRaw = this.text.slice(hPositionStart + oh.length, hPositionEnd);
            this.hideExpr = new Expr(this.parse(hExprRaw));
        }
        if (dPositionStart >= 0 && hPositionStart < 0) { // Only disable instructions found
            this.text = (this.text.slice(0, dPositionStart) + this.text.slice(dPositionEnd + cd.length));
        } else if (dPositionStart < 0 && hPositionStart >= 0) { // Only hide instructions found
            this.text = (this.text.slice(0, hPositionStart) + this.text.slice(hPositionEnd + ch.length));
        } else if (dPositionStart < hPositionStart) {
            this.text = (this.text.slice(0, dPositionStart) +
                this.text.slice(dPositionEnd + cd.length, hPositionStart) +
                this.text.slice(hPositionEnd + ch.length));
        } else if (dPositionStart > hPositionStart) {
            this.text = (this.text.slice(0, hPositionStart) +
                this.text.slice(hPositionEnd + ch.length, dPositionStart) +
                this.text.slice(dPositionEnd + cd.length));
        }
    };

    Choice.prototype.parse = function (text) {
        text = text.trim().trimEnd();
        if (text === "true") return [true];
        if (text === "false") return [false];
        if (!isNaN(text)) return [Number(text)];
        if (text[0] === '(') {
            const matchingParId = this.findMatchingParentheses(text);
            if (matchingParId === text.length - 1) return this.parse(text.slice(1, matchingParId));
        }

        // negation
        const notRe = /^(?:not|!)\s*(.*)/;
        const notReRes = notRe.exec(text);
        if (notReRes) return ["!", new Expr(this.parse(notReRes[1]))];

        // binary operations
        const re = /(\(.*\)|\d+|(?:\\v|\\V)\[\d\])\s*(<|>|<=|>=|\+|-|\*|\/)\s*(\(.*\)|\d+|(?:\\v|\\V)\[\d\])/;
        const reRes = re.exec(text);
        if (reRes) return [reRes[2], new Expr(this.parse(reRes[1])), new Expr(this.parse(reRes[3]))];

        // bool operations
        const boolRe = /(\(.*\)|true|false)\s*(\|\||&&)\s*(\(.*\)|true|false)/;
        const boolReRes = boolRe.exec(text);
        if (boolReRes) return [boolReRes[2], new Expr(this.parse(boolReRes[1])), new Expr(this.parse(boolReRes[3]))];

        // var
        const varRe = /\\(?:v|V)\[(\d+)]/;
        const varReRes = varRe.exec(text);
        if (varReRes) return ["var", new Expr(this.parse(varReRes[1]))];
    }

    Choice.prototype.interpAll = function () {
        if (this.disableExpr) this.disabled = this.interp(this.disableExpr);
        if (this.hideExpr) this.hidden = this.interp(this.hideExpr);
    }

    Choice.prototype.interp = function (expr) {
        if (expr.operand === true) return true;
        if (expr.operand === false) return false;
        if (!isNaN(expr.operand)) return Number(expr.operand);
        if (expr.operand === "var") return $gameVariables.value(this.interp(expr.arg1));
        if (expr.operand === "!") return !this.interp(expr.arg1);
        if (expr.operand === ">") return this.interp(expr.arg1) > this.interp(expr.arg2);
        if (expr.operand === "<") return this.interp(expr.arg1) < this.interp(expr.arg2);
        if (expr.operand === ">=") return this.interp(expr.arg1) >= this.interp(expr.arg2);
        if (expr.operand === "<=") return this.interp(expr.arg1) <= this.interp(expr.arg2);
        if (expr.operand === "+") return this.interp(expr.arg1) + this.interp(expr.arg2);
        if (expr.operand === "-") return this.interp(expr.arg1) - this.interp(expr.arg2);
        if (expr.operand === "*") return this.interp(expr.arg1) * this.interp(expr.arg2);
        if (expr.operand === "/") return this.interp(expr.arg1) / this.interp(expr.arg2);
        if (expr.operand === "||") return this.interp(expr.arg1) || this.interp(expr.arg2);
        if (expr.operand === "&&") return this.interp(expr.arg1) && this.interp(expr.arg2);
    }

    Choice.prototype.run = function () {
        this.parseAll();
        this.interpAll();
    };

    Choice.prototype.findMatchingParentheses = function (str) {
        let count = 1;
        let i = 1;
        while (count > 0) {
            if (str[i] === '(') count++;
            if (str[i] === ')') count--;
            i++;
        }
        return i - 1;
    }

    // bool - -
    // num - -
    // var Expr -
    // ! Expr -
    // <>= Expr Expr
    // +-*/ Expr Expr
    // &&|| Expr Expr
    function Expr() {
        this.initialize(...arguments);
    }

    Expr.prototype.initialize = function (lst) {
        if (lst) {
            [this.operand, this.arg1, this.arg2] = lst;
        }
    }

    Expr.prototype.equals = function (other) {
        const opEq = (typeof this.operand === Expr) ? this.operand.equals(other.operand) : this.operand === other.operand;
        const a1Eq = (!this.arg1 || !other.arg1) ? this.arg1 === other.arg1 : this.arg1.equals(other.arg1);
        const a2Eq = (!this.arg2 || !other.arg2) ? this.arg2 === other.arg2 : this.arg2.equals(other.arg2);
        return opEq && a1Eq && a2Eq;
    }
})();
