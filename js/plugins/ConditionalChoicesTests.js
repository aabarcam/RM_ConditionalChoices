
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


    // Dev tests
    console.log("Test 0");
    const parenthStr = "(())()";
    const choiceInst = new Choice(parenthStr);
    const res = choiceInst.findMatchingParentheses(parenthStr);
    console.assert(res === 3, "%o", [res, 3]);

    console.log("Test 1");
    const testStr = `${od}true${cd}choice`;
    const testChoice = new Choice(testStr);
    console.assert(testChoice.text === testStr, "%o", [testChoice.text, testStr]);
    testChoice.run();
    console.assert(testChoice.text === "choice", "%o", [testChoice.text, "choice"]);
    const testDisExpr = new Expr([true]);
    console.assert(testChoice.disableExpr.equals(testDisExpr), "%o", [testChoice.disableExpr, testDisExpr]);
    console.assert(testChoice.disabled === true, "%o", [testChoice.disableExpr, testDisExpr]);

    console.log("Test 2");
    const notTest = `${od}!false${cd}choice`;
    const notChoice = new Choice(notTest);
    console.assert(notChoice.text === notTest, "%o", [notChoice.text, notTest]);
    notChoice.run();
    console.assert(notChoice.text === "choice", "%o", [notChoice.text, "choice"]);
    const notExpr = new Expr(["!", new Expr([false])]);
    console.assert(notChoice.disableExpr.equals(notExpr), "%o", [notChoice.disableExpr, notExpr]);
    console.assert(notChoice.disabled === true, "%o", [notChoice.disableExpr, notExpr]);

    console.log("Test 2_1");
    const notTest2 = `${od}not false${cd}choice`;
    const notChoice2 = new Choice(notTest2);
    console.assert(notChoice2.text === notTest2, "%o", [notChoice2.text, notTest2]);
    notChoice2.run();
    console.assert(notChoice2.text === "choice", "%o", [notChoice2.text, "choice"]);
    const notExpr2 = new Expr(["!", new Expr([false])]);
    console.assert(notChoice2.disableExpr.equals(notExpr2), "%o", [notChoice2.disableExpr, notExpr2]);
    console.assert(notChoice2.disabled === true, "%o", [notChoice2.disableExpr, notExpr2]);

    console.log("Test 2_2");
    const orTest = `${od}true || false${cd}choice`;
    const orChoice = new Choice(orTest);
    console.assert(orChoice.text === orTest, "%o", [orChoice.text, orTest]);
    orChoice.run();
    console.assert(orChoice.text === "choice", "%o", [orChoice.text, "choice"]);
    const orExpr = new Expr(["||", new Expr([true]), new Expr([false])]);
    console.assert(orChoice.disableExpr.equals(orExpr), "%o", [orChoice.disableExpr, orExpr]);
    console.assert(orChoice.disabled === true, "%o", [orChoice.disableExpr, orExpr]);

    console.log("Test 2_3");
    const andTest = `${od}true && true${cd}choice`;
    const andChoice = new Choice(andTest);
    console.assert(andChoice.text === andTest, "%o", [andChoice.text, andTest]);
    andChoice.run();
    console.assert(andChoice.text === "choice", "%o", [andChoice.text, "choice"]);
    const andExpr = new Expr(["&&", new Expr([true]), new Expr([true])]);
    console.assert(andChoice.disableExpr.equals(andExpr), "%o", [andChoice.disableExpr, andExpr]);
    console.assert(andChoice.disabled === true, "%o", [andChoice.disableExpr, andExpr]);

    console.log("Test 2_4");
    const andTest2 = `${od}true && false${cd}choice`;
    const andChoice2 = new Choice(andTest2);
    console.assert(andChoice2.text === andTest2, "%o", [andChoice2.text, andTest2]);
    andChoice2.run();
    console.assert(andChoice2.text === "choice", "%o", [andChoice2.text, "choice"]);
    const andExpr2 = new Expr(["&&", new Expr([true]), new Expr([false])]);
    console.assert(andChoice2.disableExpr.equals(andExpr2), "%o", [andChoice2.disableExpr, andExpr2]);
    console.assert(andChoice2.disabled === false, "%o", [andChoice2.disableExpr, andExpr2]);

    console.log("Test 2_5");
    const andTest3 = `${od}true || (false || true)${cd}choice`;
    const andChoice3 = new Choice(andTest3);
    console.assert(andChoice3.text === andTest3, "%o", [andChoice3.text, andTest3]);
    andChoice3.run();
    console.assert(andChoice3.text === "choice", "%o", [andChoice3.text, "choice"]);
    const andExpr3 = new Expr(["||", new Expr([true]), new Expr(["||", new Expr([false]), new Expr([true])])]);
    console.assert(andChoice3.disableExpr.equals(andExpr3), "%o", [andChoice3.disableExpr, andExpr3]);
    console.assert(andChoice3.disabled === true, "%o", [andChoice3.disableExpr, andExpr3]);

    console.log("Test 3");
    const greaterTest = `${od}5 > 6${cd} choice`;
    const greaterChoice = new Choice(greaterTest);
    console.assert(greaterChoice.text === greaterTest, "%o", [greaterChoice.text, greaterTest]);
    greaterChoice.run();
    console.assert(greaterChoice.text === " choice", "%o", [greaterChoice.text, " choice"]);
    const greaterExpr = new Expr([">", new Expr([5]), new Expr([6])]);
    console.assert(greaterChoice.disableExpr.equals(greaterExpr), "%o", [greaterChoice.disableExpr, greaterExpr]);
    console.assert(greaterChoice.disabled === false, "%o", [greaterChoice.disableExpr, greaterExpr]);

    console.log("Test 4");
    const lesserTest = `${od}5 < 6${cd} choice`;
    const lesserChoice = new Choice(lesserTest);
    console.assert(lesserChoice.text === lesserTest, "%o", [lesserChoice.text, lesserTest]);
    lesserChoice.run();
    console.assert(lesserChoice.text === " choice", "%o", [lesserChoice.text, " choice"]);
    const lesserExpr = new Expr(["<", new Expr([5]), new Expr([6])]);
    console.assert(lesserChoice.disableExpr.equals(lesserExpr), "%o", [lesserChoice.disableExpr, lesserExpr]);
    console.assert(lesserChoice.disabled === true, "%o", [lesserChoice.disableExpr, lesserExpr]);

    console.log("Test 5");
    const greaterEqTest = `${od}5 >= 6${cd} choice`;
    const greaterEqChoice = new Choice(greaterEqTest);
    console.assert(greaterEqChoice.text === greaterEqTest, "%o", [greaterEqChoice.text, greaterEqTest]);
    greaterEqChoice.run();
    console.assert(greaterEqChoice.text === " choice", "%o", [greaterEqChoice.text, " choice"]);
    const greaterEqExpr = new Expr([">=", new Expr([5]), new Expr([6])]);
    console.assert(greaterEqChoice.disableExpr.equals(greaterEqExpr), "%o", [greaterEqChoice.disableExpr, greaterEqExpr]);
    console.assert(greaterEqChoice.disabled === false, "%o", [greaterEqChoice.disableExpr, greaterEqExpr]);

    console.log("Test 6");
    const lesserEqTest = `${od}5 >= 6${cd} choice`;
    const lesserEqChoice = new Choice(lesserEqTest);
    console.assert(lesserEqChoice.text === lesserEqTest, "%o", [lesserEqChoice.text, lesserEqTest]);
    lesserEqChoice.run();
    console.assert(lesserEqChoice.text === " choice", "%o", [lesserEqChoice.text, " choice"]);
    const lesserEqExpr = new Expr([">=", new Expr([5]), new Expr([6])]);
    console.assert(lesserEqChoice.disableExpr.equals(lesserEqExpr), "%o", [lesserEqChoice.disableExpr, lesserEqExpr]);
    console.assert(lesserEqChoice.disabled === false, "%o", [lesserEqChoice.disableExpr, lesserEqExpr]);

    console.log("Test 7");
    const mixTest = `${od}5 >= (2*8)${cd} choice`;
    const mixChoice = new Choice(mixTest);
    console.assert(mixChoice.text === mixTest, "%o", [mixChoice.text, mixTest]);
    mixChoice.run();
    console.assert(mixChoice.text === " choice", "%o", [mixChoice.text, " choice"]);
    const mixExpr = new Expr([">=", new Expr([5]), new Expr(["*", new Expr([2]), new Expr([8])])]);
    console.assert(mixChoice.disableExpr.equals(mixExpr), "%o", [mixChoice.disableExpr, mixExpr]);
    console.assert(mixChoice.disabled === false, "%o", [mixChoice.disableExpr, mixExpr]);

    console.log("Test 8");
    const mixTest2 = `${od}(1+2) >= (2*(3-3))${cd} choice`;
    const mixChoice2 = new Choice(mixTest2);
    console.assert(mixChoice2.text === mixTest2, "%o", [mixChoice2.text, mixTest2]);
    mixChoice2.run();
    console.assert(mixChoice2.text === " choice", "%o", [mixChoice2.text, " choice"]);
    const mixExpr2 = new Expr([">=", new Expr(["+", new Expr([1]), new Expr([2])]), new Expr(["*", new Expr([2]), new Expr(["-", new Expr([3]), new Expr([3])])])]);
    console.assert(mixChoice2.disabled === true, "%o", [mixChoice2.disableExpr, mixExpr2]);

    console.log("Test 9");
    const noneTest = `choice`;
    const noneChoice = new Choice(noneTest);
    console.assert(noneChoice.text === noneTest, "%o", [noneChoice.text, noneTest]);
    noneChoice.run();
    console.assert(noneChoice.text === "choice", "%o", [noneChoice.text, "choice"]);

    console.log("Test 10");
    const emptyTest = `${od}${cd}choice`;
    const emptyChoice = new Choice(emptyTest);
    console.assert(emptyChoice.text === emptyTest, "%o", [emptyChoice.text, emptyTest]);
    emptyChoice.run();
    console.assert(emptyChoice.text === "choice", "%o", [emptyChoice.text, "choice"]);

    console.log("Test 11");
    const disHideTest = `${od}true${cd}test${oh}true${ch}choice`;
    const disHideChoice = new Choice(disHideTest);
    console.assert(disHideChoice.text === disHideTest, "%o", [disHideChoice.text, disHideTest]);
    disHideChoice.run();
    console.assert(disHideChoice.text === "testchoice", "%o", [disHideChoice.text, "testchoice"]);

    console.log("Test 12");
    const hideDisTest = `${oh}true${ch}test${od}true${cd}choice`;
    const hideDisChoice = new Choice(hideDisTest);
    console.assert(hideDisChoice.text === hideDisTest, "%o", [hideDisChoice.text, hideDisTest]);
    hideDisChoice.run();
    console.assert(hideDisChoice.text === "testchoice", "%o", [hideDisChoice.text, "testchoice"]);
})();
