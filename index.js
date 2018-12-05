/*
let name = document.querySelector("#exampleInputName");
let gender = document.querySelectorAll("#form-user-create [name=gender]:checked");
let birth = document.querySelector("#exampleInputBirth");
let country = document.querySelector("#exampleInputCountry");
let email = document.querySelector("#exampleInputEmail");
let password = document.querySelector("#exampleInputPassword");
let file = document.querySelector("#exampleInputFile");
let admin = document.querySelector("#exampleInputAdmin");
*/

let fields = document.querySelectorAll("#form-user-create [name]");
let user = {};

fields.forEach((field, index) => {
    
    if(field.name == "gender"){
        if(field.checked){
            user[field.name] = field.value;
        }
    }else{
        user[field.name] = field.value;
    }   
    
});

console.log(user);
