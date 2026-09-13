const API_URL = "";

let editId = null;


// =====================================
// GET ALL STUDENTS
// =====================================

function getStudents() {

    fetch(API_URL + "/getall")
        .then(response => response.json())
        .then(data => {

            const table = document.getElementById("studentTable");

            table.innerHTML = "";

            data.forEach(student => {

                const row = `
                    <tr>

                        <td>
                            ${student.id}
                        </td>

                        <td>
                            <strong>${student.name}</strong>
                        </td>

                        <td>
                            ${student.rno}
                        </td>

                        <td>
                            <span class="percentage-badge">
                                ${student.per}%
                            </span>
                        </td>

                        <td>

                            <button
                                class="edit-btn"
                                onclick="editStudent(${student.id})">
                                ✏️ Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteStudent(${student.id})">
                                🗑️ Delete
                            </button>

                        </td>

                    </tr>
                `;

                table.innerHTML += row;

            });

        })
        .catch(error => {
            console.error("Error:", error);
        });
}


// =====================================
// ADD STUDENT
// =====================================

document.getElementById("addBtn").addEventListener("click", function () {

    const name = document.getElementById("name").value;
    const rno = document.getElementById("rno").value;
    const per = document.getElementById("per").value;


    if (!name || !rno || !per) {

        alert("Please fill all fields");

        return;
    }


    const data = {
        name: name,
        rno: Number(rno),
        per: Number(per)
    };


    fetch(API_URL + "/insert", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())
    .then(data => {

        alert("Student added successfully");

        clearForm();

        getStudents();

    })
    .catch(error => {

        console.error("Error:", error);

    });

});


// =====================================
// EDIT STUDENT
// =====================================

function editStudent(id) {

    fetch(API_URL + "/getall")

        .then(response => response.json())

        .then(data => {

            const student = data.find(item => item.id === id);

            if (!student) {
                return;
            }


            document.getElementById("name").value = student.name;

            document.getElementById("rno").value = student.rno;

            document.getElementById("per").value = student.per;


            editId = id;


            document.getElementById("addBtn").style.display = "none";

            document.getElementById("updateBtn").style.display = "block";

        })

        .catch(error => {

            console.error("Error:", error);

        });

}


// =====================================
// UPDATE STUDENT
// =====================================

document.getElementById("updateBtn").addEventListener("click", function () {

    const name = document.getElementById("name").value;

    const rno = document.getElementById("rno").value;

    const per = document.getElementById("per").value;


    if (!name || !rno || !per) {

        alert("Please fill all fields");

        return;
    }


    const data = {

        id: editId,

        name: name,

        rno: Number(rno),

        per: Number(per)

    };


    fetch(API_URL + "/edit", {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())

    .then(data => {

        alert("Student updated successfully");

        clearForm();

        editId = null;

        document.getElementById("addBtn").style.display = "block";

        document.getElementById("updateBtn").style.display = "none";

        getStudents();

    })

    .catch(error => {

        console.error("Error:", error);

    });

});


// =====================================
// DELETE STUDENT
// =====================================

function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {

        return;
    }


    const data = {
        id: id
    };


    fetch(API_URL + "/delete", {

        method: "DELETE",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())

    .then(data => {

        alert("Student deleted successfully");

        getStudents();

    })

    .catch(error => {

        console.error("Error:", error);

    });

}


// =====================================
// CLEAR FORM
// =====================================

function clearForm() {

    document.getElementById("name").value = "";

    document.getElementById("rno").value = "";

    document.getElementById("per").value = "";

}


// =====================================
// LOAD STUDENTS
// =====================================

getStudents();