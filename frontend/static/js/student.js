const API_URL = "";

let editId = null;


// ======================================
// GET ALL STUDENTS
// ======================================

function getStudents() {

    fetch(`${API_URL}/getall`)
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to get students");
            }

            return response.json();

        })

        .then(data => {

            console.log("STUDENT DATA:", data);

            const table =
                document.getElementById("studentTable");

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

                            <button
                                onclick="deleteStudent(${student.id})">
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

                table.innerHTML += row;

            });

        })

        .catch(error => {

            console.error(
                "Get Students Error:",
                error
            );

        });
}


// ======================================
// ADD STUDENT
// ======================================

function addStudent() {

    const name =
        document.getElementById("name").value.trim();

    const rno =
        document.getElementById("rno").value;

    const per =
        document.getElementById("per").value;


    if (!name || !rno || !per) {

        alert("Please fill all fields.");

        return;
    }


    const data = {

        name: name,

        rno: parseInt(rno),

        per: parseFloat(per)

    };


    fetch(`${API_URL}/insert`, {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Add student failed");
        }

        return response.json();

    })

    .then(result => {

        console.log(
            "ADD RESPONSE:",
            result
        );

        alert(
            "Student added successfully!"
        );


        document.getElementById(
            "name"
        ).value = "";

        document.getElementById(
            "rno"
        ).value = "";

        document.getElementById(
            "per"
        ).value = "";


        getStudents();

    })

    .catch(error => {

        console.error(
            "Add Student Error:",
            error
        );

    });

}


// ======================================
// EDIT STUDENT
// ======================================

function editStudent(id) {

    editId = id;


    fetch(`${API_URL}/getall`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to get student data"
                );
            }

            return response.json();

        })

        .then(data => {

            const student =
                data.find(
                    student =>
                        student.id === id
                );


            if (!student) {

                alert(
                    "Student not found."
                );

                return;
            }


            document.getElementById(
                "name"
            ).value = student.name;


            document.getElementById(
                "rno"
            ).value = student.rno;


            document.getElementById(
                "per"
            ).value = student.per;


            document.getElementById(
                "addBtn"
            ).style.display = "none";


            document.getElementById(
                "updateBtn"
            ).style.display = "inline-block";

        })

        .catch(error => {

            console.error(
                "Edit Student Error:",
                error
            );

        });

}


// ======================================
// UPDATE STUDENT
// ======================================

function updateStudent() {

    if (editId === null) {

        alert(
            "Please select a student first."
        );

        return;
    }


    const data = {

        id: editId,

        name:
            document.getElementById(
                "name"
            ).value.trim(),

        rno:
            parseInt(
                document.getElementById(
                    "rno"
                ).value
            ),

        per:
            parseFloat(
                document.getElementById(
                    "per"
                ).value
            )

    };


    fetch(`${API_URL}/edit`, {

        method: "PUT",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Update student failed"
            );
        }

        return response.json();

    })

    .then(result => {

        console.log(
            "UPDATE RESPONSE:",
            result
        );

        alert(
            "Student updated successfully!"
        );


        editId = null;


        document.getElementById(
            "name"
        ).value = "";

        document.getElementById(
            "rno"
        ).value = "";

        document.getElementById(
            "per"
        ).value = "";


        document.getElementById(
            "addBtn"
        ).style.display =
            "inline-block";


        document.getElementById(
            "updateBtn"
        ).style.display =
            "none";


        getStudents();

    })

    .catch(error => {

        console.error(
            "Update Student Error:",
            error
        );

    });

}


// ======================================
// DELETE STUDENT
// ======================================

function deleteStudent(id) {

    const data = {

        id: id

    };


    fetch(`${API_URL}/delete`, {

        method: "DELETE",

        headers: {

            "Content-Type":
                "application/json"

        },

        body: JSON.stringify(data)

    })

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Delete student failed"
            );
        }

        return response.json();

    })

    .then(result => {

        console.log(
            "DELETE RESPONSE:",
            result
        );

        alert(
            "Student deleted successfully!"
        );


        getStudents();

    })

    .catch(error => {

        console.error(
            "Delete Student Error:",
            error
        );

    });

}


// ======================================
// BUTTON EVENTS
// ======================================

document
    .getElementById("addBtn")
    .addEventListener(
        "click",
        addStudent
    );


document
    .getElementById("updateBtn")
    .addEventListener(
        "click",
        updateStudent
    );


// ======================================
// PAGE LOAD
// ======================================

getStudents();