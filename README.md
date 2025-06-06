# Conditional Choices


This plugin allows to write custom conditions in each choice text
box of the [Show Choices...] command, so that the choices appear
as disabled or hidden in game.

You may use this plugin free of charge for commercial or non-commercial projects. Credit is appreciated.

## Installation

Download the file '[ConditionalChoices.js](https://github.com/aabarcam/RM_ConditionalChoices/blob/main/js/plugins/ConditionalChoices.js)' and place it inside the "js/plugins" path of your project's files.

## Compatibility

Developed and tested for RPG Maker MZ.

Compatible with my [More Choices](https://github.com/aabarcam/RM_MoreChoices) plugin.

Compatibility with RPG Maker MV or other MZ plugins untested.

## How to use

Write your conditions for disabling a choice in its text box, between
an opening tag ```<dis>``` and a closing tag ```</dis>```.<br>
Likewise, write you conditions for disabling a choice in its text box
between an opening tag ```<hide>``` and a closing tag ```</hide>```.
If the conditions inside the tags result in a 'true' value, then the
choice is disabled or hidden, depending on the tags used.

You may use both disable and hide conditions on the same choice.

Only a maximum of one disable and one hide conditions is allowed per
choice. See below for the use of 'or' and 'and' operations if you need
to chain several conditions together.


## Values
### ```<boolean>```
- ```true```: always evaluates to ```true```
- ```false```: always evaluates to ```false```
  - Ex. ```<dis>true</dis>```<br>
      This would disable the choice.

### ```<number>```
  Any number evaluates to itself, to be operated with other ```<number>``` values.<br>
 - Ex. ```<hide>7 > 0</hide>```<br>
   -    These two ```<numbers>``` are compared and the expression evaluates to ```true```,
      hiding the choice.

## Operations:
- ```!```: Negates the truth value of a ```<boolean>```. Turns ```true``` into ```false``` and ```false``` into ```true```.<br>
   Use: 
   - ```!<boolean>```<br>
    - ```not <boolean>```<br>
   - Ex. ```<dis> !true </dis>```<br>
       ```<dis> not true </dis>```<br>
   These would evaluate to ```false``` and not disable the choice.
- ```||```: 'OR' operator, compares two ```<boolean>``` values.
    Evaluates into ```true``` if any of the two values compared is ```true```.
    - Use: ```<boolean> || <boolean>```<br>
    - Ex. ```<dis>true || false</dis>```<br>
    Since one of the values is ```true```, this would evaluate to ```true```
    and disable the choice.
- ```&&```: 'AND' operator, compares two ```<boolean>``` values.
    Evaluates into ```true``` if both values compared are ```true```.
    - Use: ```<boolean> && <boolean>```
    - Ex. ```<dis>true && false</dis>```<br>
    Since one of the values is ```false```, this would evaluate to ```false```
    and not disable the choice.
- ```==```: Compares two ```<numbers>``` into a ```<boolean>```.
    Evaluates to ```true``` if the first number is equal to the second.
    - Use: ```<number> == <number>```
    - Ex. ```<dis> 7 == 7 </dis>```<br>
    This would evaluate to ```true``` and disable the choice.
- ```>```: Compares two ```<numbers>``` into a ```<boolean>```.
   Evaluates to ```true``` if the first number is greater than the second.
   - Use: ```<number> > <number>```
   - Ex. ```<dis> 7 > 9 </dis>```<br>
   This would evaluate to ```false``` and not disable the choice.
- ```>=```: compares two ```<numbers>``` into a ```<boolean>```.
    Evaluates to ```true``` if the first number is greater or equal than the second.
    - Use: ```<number> >= <number>```
    - Ex. ```<dis> 7 >= 7 </dis>```<br>
    This would evaluate to ```true``` and disable the choice.
- ```<```: compares two ```<numbers>``` into a ```<boolean>```.
   Evaluates to ```true``` if the first number is lesser than the second.
   - Use: ```<number> < <number>```
   - Ex. ```<dis> 7 < 9 </dis>```<br>
   This would evaluate to ```true``` and disable the choice.
- ```<=```: compares two ```<numbers>``` into a ```<boolean>```.
    Evaluates to ```true``` if the first number is lesser or equal than the second.
    - Use: ```<number> <= <number>```
    - Ex. ```<dis> 7 <= 9 </dis>```<br>
    This would evaluate to ```true``` and disable the choice.

## Number operations
- ```+```: adds two ```<numbers>``` into another ```<number>```.
   - Use: ```<number> + <number>```
   - Ex. 5 + 6 -> 11
- ```-```: substracts two ```<numbers>``` into another ```<number>```.
   - Use: ```<number> - <number>```
   - Ex. 5 - 2 -> 3
- ```*```: multiplies two ```<numbers>``` into another ```<number>```.
   - Use: ```<number> * <number>```
   - Ex. 2 * 4 -> 8
- ```/```: divides two ```<numbers>``` into another ```<number>```.
   - Use: ```<number> / <number>```
   - Ex. 1 / 5 -> 0.2

## Accessing variables
You can access the value of a variable set by the [Control Variables...]
command with the syntax ```\v[n]```, where ```n``` is the variable number.
- Use: ```\v[<number>]```
- Ex. ```<hide>\v[1] > 0</hide>```<br>
This retrieves the value of variable 1 in your game and hides the choice
if said value is greater than zero.
Chaining conditions

Since you may only use one set of disable or hide tags, use the OR and AND
operators if you need to check for several conditions.

## Parentheses

Use parentheses to dictate the order of the operations, otherwise execution will follow [JavaScript's operation precedence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence).

# Examples
Choices<br>
#1: ```<dis> (\v[1] > 0) && (\v[1] < 100) </dis>First choice!```<br>
#2: ```<dis> (\v[1] > 0) || (\v[2] == \v[3] + 3) </dis>Second choice!```<br>
#3: ```<dis> (\v[1] == 0) || (\v[2] > 0 && \v[3] > 0) </dis><hide>\v[3] == 90</hide>Third choice!```

In these examples, the first choice would be disabled if variable 1 has 
a value greater than 0 and lesser than 100.<br> The second would be disabled
if variable 1 has a value greater than 0 or if variable 2 has a value
equal to variable 3 plus 3.<br> The third would be disabled if either 
variable 1 is equal to 0, or if both variables 2 and 3 are greater than 0, 
and it would be hidden if variable 3 is equal to 90.

The text on these choices would not show your conditions, and they would
read 'First choice!', 'Second choice!' and 'Third choice!' respectively.
The whitespaces or text outside of the tags are kept, so if you have a
space separating the dis and hide tags, it may show in your final choice
text.

Some of the parentheses in the examples are not strictly necessary but remain
there for clarity.