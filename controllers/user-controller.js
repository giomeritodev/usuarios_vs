class UserController {


    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();

    }//Fim do construct

    onEdit() {

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {
            this.showPanelCreate();
        });

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();
            this.getButtonUpdate().disabled = true;
            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo
                    } else {
                        result._photo = content;
                    }

                    tr.dataset.user = JSON.stringify(result);

                    tr.innerHTML = `
                    <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${result._name}</td>
                    <td>${result._email}</td>
                    <td>${(result._admin) ? 'Sim' : 'Não'}</td>
                    <td>${Utils.dateFormat(result._register)}</td>
                    <td>
                        <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                        <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                    </td>
                `;

                    this.addEventsTr(tr);
                    this.updateCount();
                    
                    this.formUpdateEl.reset();
                    this.getButtonUpdate().disabled = false;
                    this.showPanelCreate();

                }, (e) => {
                    console.error(e);
                }
            );

        });
    }

    getButton() {
        return this.formEl.querySelector("[type=submit]");
    }

    getButtonUpdate() {
        return this.formUpdateEl.querySelector("[type=submit]");
    }

    onSubmit() {
        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let values = this.getValues(this.formEl);

            if (!values) return false;

            this.getButton().disabled = true;

            this.getPhoto(this.formEl).then(
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

    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
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

    getValues(formEl) {

        let user = {};
        let isValid = true;

        //... => Spread
        [...formEl.elements].forEach(field => {

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
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        this.tableEl.appendChild(tr);

        this.updateCount();

    }//Fechando o metodo addLine()

    addEventsTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", (e) => {

            if(confirm("Deseja realmente excluir?")){
                tr.remove();
                this.updateCount();
            }
        });


        tr.querySelector(".btn-edit").addEventListener("click", (e) => {
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            //Pega o valor do campo do form e o valor para cada linha
            for (let name in json) {
                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {
                    switch (field.type) {
                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
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

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();
        });
    }//Fechamento do metodo addEventsTr()

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
    }//Fechamento do showPanelCreate()

    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }//Fechamento do showPanelUpdate()
}