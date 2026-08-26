const API_URL = "";

let editId = null;


// ======================================
// GET ALL STUDENTS
// ======================================

getStudents();

function getStudents() {

    fetch(`${API_URL}/getall`)
        .then(response => response.json())
        .then(data => {

            console.log(data);

            const table = document.getElementById("studentTable");

            table.innerHTML = "";

            data.forEach(student => {

                const row = `
                    <tr>

                        <td>${student.id}</td>

                        <td>${student.name}</td>

                        <td>${student.rno}</td>

                        <td>${student.per}</td>

                        <td>

                            <button
                                onclick="editStudent(${student.id})">
                                Edit
                            </button>

                            <button onclick="deleteStudent(${student.id})"> Delete</button>

                        </td>

                    </tr>
                `;

                table.innerHTML += row;
            });

        })

        .catch(error => {

            console.log("Error:", error);

        });
}



// ======================================
// ADD STUDENT
// ======================================

document
    .getElementById("addBtn")
    .addEventListener("click", addStudent);


function addStudent() {

    const name = document.getElementById("name").value;

    const rno = document.getElementById("rno").value;

    const per = document.getElementById("per").value;


    const data = {

        name: name,

        rno: parseInt(rno),

        per: parseFloat(per)

    };


    fetch(`${API_URL}/insert`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())

    .then(result => {

        console.log(result);

        alert("Student added successfully!");


        // Clear form

        document.getElementById("name").value = "";

        document.getElementById("rno").value = "";

        document.getElementById("per").value = "";


        // Refresh table

        getStudents();

    })

    .catch(error => {

        console.log("Error:", error);

    });

}



// ======================================
// EDIT STUDENT
// ======================================

function editStudent(id) {

    editId = id;


    fetch(`${API_URL}/getall`)

        .then(response => response.json())

        .then(data => {


            const student =
                data.find(student => student.id === id);


            document.getElementById("name").value =
                student.name;


            document.getElementById("rno").value =
                student.rno;


            document.getElementById("per").value =
                student.per;


            // Hide Add button

            document.getElementById("addBtn")
                .style.display = "none";


            // Show Update button

            document.getElementById("updateBtn")
                .style.display = "inline-block";

        })

        .catch(error => {

            console.log("Error:", error);

        });

}



// ======================================
// UPDATE STUDENT
// ======================================

document
    .getElementById("updateBtn")
    .addEventListener("click", updateStudent);


function updateStudent() {


    const data = {

        id: editId,

        name:
            document.getElementById("name").value,

        rno:
            parseInt(
                document.getElementById("rno").value
            ),

        per:
            parseFloat(
                document.getElementById("per").value
            )

    };


    fetch(`${API_URL}/edit`, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())

    .then(result => {

        console.log(result);

        alert("Student updated successfully!");


        // Reset edit ID

        editId = null;


        // Clear form

        document.getElementById("name").value = "";

        document.getElementById("rno").value = "";

        document.getElementById("per").value = "";


        // Show Add button

        document.getElementById("addBtn")
            .style.display = "inline-block";


        // Hide Update button

        document.getElementById("updateBtn")
            .style.display = "none";


        // Refresh table

        getStudents();

    })

    .catch(error => {

        console.log("Error:", error);

    });

}

/* delete record*/

function deleteStudent(id) {

    const data = {
        id: id
    };

    fetch(`${API_URL}/delete`, {

        method: "DELETE",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    })
    .then(response => response.json())
    .then(result => {

        console.log(result);

        alert("Student deleted successfully!");

        getStudents();

    })
    .catch(error => {

        console.log("Error:", error);

    });
}