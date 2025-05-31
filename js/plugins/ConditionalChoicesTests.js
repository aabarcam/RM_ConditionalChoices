
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

        if (nextOpId.length !== 0) { // found an operation
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
                    (precedence[nextTwo] === precedence[string.slice(op[0], op[0] + op[1])] && nextTwo !== "**")) {
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


    // Dev tests
    console.log("Test 0");
    const parenthStr = "(())()";
    const choiceInst = new Choice(parenthStr);
    const res = findMatchingParentheses(parenthStr, 0);
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

    console.log("Test 13");
    const equalsTest = `${od}5 == 6${cd} choice`;
    const equalsChoice = new Choice(equalsTest);
    console.assert(equalsChoice.text === equalsTest, "%o", [equalsChoice.text, equalsTest]);
    equalsChoice.run();
    console.assert(equalsChoice.text === " choice", "%o", [equalsChoice.text, " choice"]);
    const equalsExpr = new Expr(["==", new Expr([5]), new Expr([6])]);
    console.assert(equalsChoice.disableExpr.equals(equalsExpr), "%o", [equalsChoice.disableExpr, equalsExpr]);
    console.assert(equalsChoice.disabled === false, "%o", [equalsChoice.disableExpr, equalsExpr]);

    [["*", "/", "%"], ["+", "-"], ["<", ">", "<=", ">="], ["==", "!="], ["&&"], ["||"]]
    console.log("Test operation order")
    const orderTest = `${od}10 == 1 + 1 * 9 && 18 > 2 + 5 * 3${cd}${oh}true || !true && 10 == 2 + 1 * 9${ch}choice`;
    const orderChoice = new Choice(orderTest);
    console.assert(orderChoice.text === orderTest, "%o", [orderChoice.text, orderTest]);
    orderChoice.run();
    console.assert(orderChoice.text === "choice", "%o", [orderChoice.text, "choice"]);
    const orderExprDis = new Expr(["&&", new Expr(["==", new Expr([10]), new Expr(["+", new Expr([1]), new Expr(["*", new Expr([1]), new Expr([9])])])]),
        new Expr([">", new Expr([18]), new Expr(["+", new Expr([2]), new Expr(["*", new Expr([5]), new Expr([3])])])])]);
    console.assert(orderChoice.disableExpr.equals(orderExprDis), "%o", [orderChoice.disableExpr, orderExprDis]);
    console.assert(orderChoice.disabled === true, "%o", [orderChoice.disabled, true]);

    const orderExprHide = new Expr(["||", new Expr([true]), new Expr(["&&", new Expr(["!", new Expr([true])]),
        new Expr(["==", new Expr([10]), new Expr(["+", new Expr([2]), new Expr(["*", new Expr([1]), new Expr([9])])])])])])
    console.assert(orderChoice.hideExpr.equals(orderExprHide), "%o", [orderChoice.hideExpr, orderExprHide]);
    console.assert(orderChoice.hidden === true, "%o", [orderChoice.hidden, true]);

    console.log("Test Expo");
    const expTest = `${od}31250 == 2 * 5 ** 6${cd} choice`;
    const expChoice = new Choice(expTest);
    console.assert(expChoice.text === expTest, "%o", [expChoice.text, expTest]);
    expChoice.run();
    console.assert(expChoice.text === " choice", "%o", [expChoice.text, " choice"]);
    const expExpr = new Expr(["==", new Expr([31250]), new Expr(["*", new Expr([2]), new Expr(["**", new Expr([5]), new Expr([6])])])]);
    console.assert(expChoice.disableExpr.equals(expExpr), "%o", [expChoice.disableExpr, expExpr]);
    console.assert(expChoice.disabled === true, "%o", [expChoice.disabled, true]);

    console.log("Test Expo");
    const remTest = `${od}0 != 5 % 2${cd}${oh}512==2**3**2${ch} choice`;
    const remChoice = new Choice(remTest);
    console.assert(remChoice.text === remTest, "%o", [remChoice.text, remTest]);
    remChoice.run();
    console.assert(remChoice.text === " choice", "%o", [remChoice.text, " choice"]);
    const remExpr = new Expr(["!=", new Expr([0]), new Expr(["%", new Expr([5]), new Expr([2])])]);
    console.assert(remChoice.disableExpr.equals(remExpr), "%o", [remChoice.disableExpr, remExpr]);
    console.assert(remChoice.disabled === true, "%o", [remChoice.disabled, true]);

    const remExprHide = new Expr(["==", new Expr([512]), new Expr(["**", new Expr([2]), new Expr(["**", new Expr([3]), new Expr([2])])])]);
    console.assert(remChoice.hideExpr.equals(remExprHide), "%o", [remChoice.hideExpr, remExprHide]);
    console.assert(remChoice.hidden === true, "%o", [remChoice.hidden, true]);
})();
