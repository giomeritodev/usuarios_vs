class UserController {


    constructor(formId, tableId) {

        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();

    }//Fim do construct

    onEdit() {

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate();
        });
    }

    getButton() {
        return this.formEl.querySelector("[type=submit]");
    }

    onSubmit() {
        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let values = this.getValues();

            if (!values) return false;

            this.getButton().disabled = true;

            this.getPhoto().then(
                (content) => {
                    values.photo = content;

                    this.addLine(values);

                    this.formEl.reset();
                    this.getButton().disabled = false;

                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }//Fechando onSubmit()

    getPhoto() {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl.elements].filter(item => {
                if (item.name === "photo") {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            };

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        });


    }//Fechando o método getPhoto()

    getValues() {

        let user = {};
        let isValid = true;

        //... => Spread
        [...this.formEl.elements].forEach(field => {

            if (["name", "email", "password"].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if (field.name == "gender") {
                if (field.checked) {
                    user[field.name] = field.value;
                }
            } else if (field.name == "admin") {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });

        if (!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }//Fechando o Método getVelues()

    //Metodo para salvar os dados na tabela
    addLine(dataUser) {

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        `;

        tr.querySelector(".btn-edit").addEventListener("click", (e) => {
            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-update");

            //Pega o valor do campo do form e o valor para cada linha
            for (let name in json) {
                let field = form.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {
                    switch(field.type){
                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = form.querySelector("[name=" + name.replace("_", "") + "][value="+json[name]+"]");
                            field.checked = true;
                            break;
                        
                        case 'checkbox':
                            field.checked = json[name];    
                            break;

                        default:    
                            field.value = json[name];
                    }       
                }
            }

            this.showPanelUpdate();
        });

        this.tableEl.appendChild(tr);

        this.updateCount();

    }//Fechando o metodo addLine()

    updateCount() {

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            if (JSON.parse(tr.dataset.user)._admin) numberAdmin++;
        });

        document.querySelector("#numbers-users").innerHTML = numberUsers;
        document.querySelector("#numbers-users-admin").innerHTML = numberAdmin;


    }//Fechamento do updateCount()

    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }
}