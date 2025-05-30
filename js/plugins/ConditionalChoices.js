
//=============================================================================
// Conditional Choices
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Allows the user to disable or hide choices depending on custom conditions.
 * @author Pwino
 * @url https://github.com/aabarcam/RM_ConditionalChoices
 *
 * @help ConditionalChoices
 * 
 * This plugin allows to write custom conditions in each choice text
 * box of the [Show Choices...] command, so that the choices appear
 * as disabled or hidden in game.
 * 
 * How to use
 * 
 * Write your conditions for disabling a choice in its text box, between
 * an opening tag <dis> and a closing tag </dis>.
 * Likewise, write you conditions for disabling a choice in its text box
 * between an opening tag <hide> and a closing tag </hide>.
 * If the conditions inside the tags result in a 'true' value, then the
 * choice is disabled or hidden, depending on the tags used.
 * 
 * You may use both disable and hide conditions on the same choice.
 * 
 * Only a maximum of one disable and one hide conditions is allowed per
 * choice. See below for the use of 'or' and 'and' operations if you need
 * to chain several conditions together.
 * 
 * Values:
 * <boolean>
 *   true: always evaluates to true
 *   false: always evaluates to false
 *   Ex. <dis>true</dis>
 *       This would disable the choice.
 * <number>
 *   Any number evaluates to itself, to be operated with other <number> values.
 *   Ex. <hide>7 > 0</hide>
 *       These two <numbers> are compared and the expression evaluates to true,
 *       hiding the choice.
 * 
 * Boolean operations:
 * !: Negates the truth value of a <boolean>.
 *    Turns true into false and false into true.
 *    Use: !<boolean>
 *         not <boolean>
 *    Ex. <dis> !true </dis>
 *        <dis> not true </dis>
 *    These would evaluate to false and not disable the choice.
 * ||: 'OR' operator, compares two <boolean> values.
 *     Evaluates into true if any of the two values compared is true.
 *     Use: <boolean> || <boolean>
 *     Ex. <dis>true || false</dis>
 *     Since one of the values is true, this would evaluate to true
 *     and disable the choice.
 * &&: 'AND' operator, compares two <boolean> values.
 *     Evaluates into true if both values compared are true.
 *     Use: <boolean> && <boolean>
 *     Ex. <dis>true && false</dis>
 *     Since one of the values is false, this would evaluate to false
 *     and not disable the choice.
 * ==: Compares two <numbers> into a <boolean>.
 *     Evaluates to true if the first number is equal to the second.
 *     Use: <number> == <number>
 *     Ex. <dis> 7 == 7 </dis>
 *     This would evaluate to true and disable the choice.
 * >: Compares two <numbers> into a <boolean>.
 *    Evaluates to true if the first number is greater than the second.
 *    Use: <number> > <number>
 *    Ex. <dis> 7 > 9 </dis>
 *    This would evaluate to false and not disable the choice.
 * >=: compares two <numbers> into a <boolean>.
 *     Evaluates to true if the first number is greater or equal than the second.
 *     Use: <number> >= <number>
 *     Ex. <dis> 7 >= 7 </dis>
 *     This would evaluate to true and disable the choice.
 * <: compares two <numbers> into a <boolean>.
 *    Evaluates to true if the first number is lesser than the second.
 *    Use: <number> < <number>
 *    Ex. <dis> 7 < 9 </dis>
 *    This would evaluate to true and disable the choice.
 * <=: compares two <numbers> into a <boolean>.
 *     Evaluates to true if the first number is lesser or equal than the second.
 *     Use: <number> <= <number>
 *     Ex. <dis> 7 <= 9 </dis>
 *     This would evaluate to true and disable the choice.
 * 
 * Binary number operations:
 * +: adds two <numbers> into another <number>.
 *    Use: <number> + <number>
 *    Ex. 5 + 6 -> 11
 * -: substracts two <numbers> into another <number>.
 *    Use: <number> - <number>
 *    Ex. 5 - 2 -> 3
 * *: multiplies two <numbers> into another <number>.
 *    Use: <number> * <number>
 *    Ex. 2 * 4 -> 8
 * /: divides two <numbers> into another <number>.
 *    Use: <number> / <number>
 *    Ex. 1 / 5 -> 0.2
 * 
 * Accessing variables:
 * You can access the value of a variable set by the [Control Variables...]
 * command with the syntax '\v[n]', where 'n' is the variable number.
 * Use: \v[<number>]
 * Ex. <hide>\v[1] > 0</hide>
 * This retrieves the value of variable 1 in your game and hides the choice
 * if said value is greater than zero.
 *
 * Chaining conditions
 * 
 * Since you may only use one set of disable or hide tags, use the OR and AND
 * operators if you need to check for several conditions.
 * 
 * Parentheses
 * 
 * Use parentheses to dictate the order of the operations, otherwise execution 
 * will followJavaScript's operation precedence.
 * 
 * Examples
 * Choices
 * #1: <dis> (\v[1] > 0) && (\v[1] < 100) </dis>First choice!
 * #2: <dis> (\v[1] > 0) || (\v[2] == (\v[3] + 3) ) </dis>Second choice!
 * #3: <dis> (\v[1] == 0) || ((\v[2] > 0) && (\v[3] > 0)) </dis><hide>\v[3] == 90</hide>Third choice!
 * 
 * In these examples, the first choice would be disabled if variable 1 has 
 * a value greater than 0 and lesser than 100. The second would be disabled
 * if variable 1 has a value greater than 0 or if variable 2 has a value
 * equal to variable 3 plus 3. The third would be disabled if either 
 * variable 1 is equal to 0, or if both variables 2 and 3 are greater than 0, 
 * and it would be hidden if variable 3 is equal to 90.
 * 
 * The text on these choices would not show your conditions, and they would
 * read 'First choice!', 'Second choice!' and 'Third choice!' respectively.
 * The whitespaces or text outside of the tags are kept, so if you have a
 * space separating the dis and hide tags, it may show in your final choice
 * text.
 * 
 */

//-----------------------------------------------------------------------------

(() => {
    'use strict';

    const od = "<dis>";
    const cd = "</dis>";
    const oh = "<hide>";
    const ch = "</hide>";


    // Fix window size
    let _Window_UpdatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function () {
        const _GameMsg_Choices = $gameMessage.choices;
        const originalChoices = $gameMessage.choices();
        $gameMessage.choices = function () { return previewChoicesState(originalChoices.clone()) }
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

    function findMatchingParentheses(str, start) {
        let count = 1;
        let i = start + 1;
        while (count > 0) {
            if (i >= str.length) {
                console.error("Matching parentheses not found.");
                return str.length;
            }
            if (str[i] === '(') count++;
            if (str[i] === ')') count--;
            i++;
        }
        return i - 1;
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
        text = text.replace("not", "!").trim().trimEnd();
        if (text === "true") return [true];
        if (text === "false") return [false];
        if (!isNaN(text)) return [Number(text)];
        if (text[0] === '(') {
            const matchingParId = findMatchingParentheses(text, 0);
            if (matchingParId === text.length - 1) {
                return this.parse(text.slice(1, matchingParId));
            }
        }

        const nextOpId = lowestPrecedence(text);

        if (nextOpId) { // found an operation
            const op = text.slice(nextOpId[0], nextOpId[0] + nextOpId[1]);
            if (op === '!') {
                const firstExpr = text.slice(nextOpId[0] + nextOpId[1]).trim().trimEnd();
                return [op, new Expr(this.parse(firstExpr))];
            } else {
                const firstExpr = text.slice(0, nextOpId[0]).trim().trimEnd();
                const secondExpr = text.slice(nextOpId[0] + nextOpId[1]).trim().trimEnd();
                return [op, new Expr(this.parse(firstExpr)), new Expr(this.parse(secondExpr))];
            }
        }

        // else, it's a variable access
        const varRe = /^\\[vV]\[(\d+)\]$/;
        const varRes = varRe.exec(text);
        if (varRes) {
            return ["var", new Expr(this.parse(varRes[1]))];
        }

        console.error("Unknown operation detected in: ", text);
        return;
    }

    // return an next in line for lowest precedence operation and length of operation
    function lowestPrecedence(string) {
        const precedence = { "!": 14, "**": 13, "*": 12, "/": 12, "%": 12, "+": 11, "-": 11, "<": 9, ">": 9, ">=": 9, "<=": 9, "!=": 8, "==": 8, "&&": 4, "||": 3 };
        let op = [];
        let i = 0;
        while (i < string.length) {
            const next = string[i];
            const nextTwo = string[i + 1] ? (string[i] + string[i + 1]) : null;
            if (next == '(') {
                // skip parentheses
                i = findMatchingParentheses(string, i) + 1;
                continue;
            }
            if (Object.keys(precedence).includes(nextTwo)) {
                if (op.length === 0 ||
                    precedence[nextTwo] < precedence[string.slice(op[0], op[0] + op[1])] ||
                    (precedence[nextTwo] === precedence[string.slice(op[0], op[0] + op[1])] && precedence[nextTwo] !== "**")) {
                    op = [i, 2];
                }
                i++;
            } else if (Object.keys(precedence).includes(next)) {
                if (op.length === 0 ||
                    precedence[next] <= precedence[string.slice(op[0], op[0] + op[1])]) {
                    op = [i, 1];
                }
            }
            i++;
        }
        return op;
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
        if (expr.operand === "==") return this.interp(expr.arg1) === this.interp(expr.arg2);
        if (expr.operand === "!=") return this.interp(expr.arg1) !== this.interp(expr.arg2);
        if (expr.operand === "+") return this.interp(expr.arg1) + this.interp(expr.arg2);
        if (expr.operand === "-") return this.interp(expr.arg1) - this.interp(expr.arg2);
        if (expr.operand === "*") return this.interp(expr.arg1) * this.interp(expr.arg2);
        if (expr.operand === "**") return this.interp(expr.arg1) ** this.interp(expr.arg2);
        if (expr.operand === "/") return this.interp(expr.arg1) / this.interp(expr.arg2);
        if (expr.operand === "||") return this.interp(expr.arg1) || this.interp(expr.arg2);
        if (expr.operand === "&&") return this.interp(expr.arg1) && this.interp(expr.arg2);
    }

    Choice.prototype.run = function () {
        this.parseAll();
        this.interpAll();
    };

    // bool - -
    // num - -
    // var Expr -
    // ! Expr -
    // <>= Expr Expr
    // **+-*/ Expr Expr
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
