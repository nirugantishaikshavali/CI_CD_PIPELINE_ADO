import { LightningElement } from 'lwc';

export default class Testing extends LightningElement {
    handleChange(event){
        alert("You clicked the button!");

    }
}