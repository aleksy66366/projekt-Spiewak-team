import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

const keyboard = new Keyboard({
    onChange: input => onChange(input),
    onKeyPress: button => onKeyPress(button)
});

function onChange(input){
    document.querySelector(".input").value = input;
    console.log("Input changed", input);
}

function onKeyPress(button){
    console.log("Button pressed", button);
}
