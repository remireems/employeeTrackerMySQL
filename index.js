const { prompt } = require('inquirer')
const { createConnection } = require('mysql2')
require('console.table')

const db = createConnection('mysql://root:rootroot@localhost/companyEmployees_db')

// function to prompt menu
const menu = () => {
  prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: ['Add department', 'Add role', 'Add employee', 'View departments', 'View roles', 'View employees', 'Update employee']
    }
  ])
    .then(({ action }) => {
      switch (action) {
        case 'Add department':
          addDepartment()
          break;
        case 'Add role':
          addRole()
          break;
        case 'Add employee':
          addEmployee()
          break;
        case 'View departments':
          viewDepartments()
          break;
        case 'View roles':
          viewRoles()
          break;
        case 'View employees':
          viewEmployees()
          break;
        case 'Update employee':
          updateEmployee()
          break;
      }
    })
    .catch(err => console.log(err))
}

// function to add departments
const addDepartment = () => {
  prompt([
    {
      type: 'input',
      name: 'name',
      message: "Please enter new department's name:"
    }
  ])
    .then(newDep => {
      db.query('INSERT INTO department SET ?', newDep, err => {
        if (err) {
          console.log(err)
        } else {
          console.log(`${newDep.name} department has been added!`)
          menu()
        }
      })
    })
    .catch(err => console.log(err))
}

// function to add roles
const addRole = () => {
  prompt([
    {
      type: 'input',
      name: 'title',
      message: "Please enter role's title:"
    },
    {
      type: 'number',
      name: 'salary',
      message: "Please enter role's salary:"
    },
    {
      type: 'input',
      name: 'department_id',
      message: "Please enter role's department id:"
    }
  ])
    .then(newRole => {
      db.query('INSERT INTO role SET ?', newRole, err => {
        if (err) {
          console.log(err)
        } else {
          console.log(`${newRole.title} role has been added!`)
          menu()
        }
      })
    })
    .catch(err => console.log(err))
}

// function to add employees
const addEmployee = () => {
  prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "Please enter employee's first name:"
    },
    {
      type: 'input',
      name: 'last_name',
      message: "Please enter employee's last name:"
    },
    {
      type: 'input',
      name: 'role_id',
      message: "Please enter employee's role id:"
    },
    {
      type: 'input',
      name: 'manager_id',
      message: "Please enter employee's manager id:"
    }
  ])
    .then(newEmp => {
      if (!newEmp.manager_id) {
        delete newEmp.manager_id
      }
      console.log(newEmp)

      db.query('INSERT INTO employee SET ?', newEmp, err => {
        if (err) {
          console.log(err)
        } else {
          console.log(`${newEmp.first_name} ${newEmp.last_name} has been added!`)
          menu()
        }
      })
    })
    .catch(err => console.log(err))
}

// function to view departments
const viewDepartments = () => {
  db.query('SELECT department.id, department.name as department FROM department', (err, department) => {
    console.table(department)
    menu()
  })
}

// function to view roles
const viewRoles = () => {
  db.query('SELECT role.id, role.title, role.salary, department.name AS department FROM role LEFT JOIN department ON role.department_id = department.id', (err, role) => {
    console.table(role)
    menu()
  })
}

// function to view employees
const viewEmployees = () => {
  db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id", (err, employee) => {
    console.table(employee)
    menu()
  })
}

// function to update employee's role and manager
const updateEmployee = () => {
  db.query('SELECT * FROM role', (err, role) => {
    db.query('SELECT * FROM employee', (err, employee) => {
      prompt([
        {
          type: 'list',
          name: 'id',
          message: 'Select an employee to update:',
          choices: employee.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
          }))
        },
        {
          type: 'list',
          name: 'role_id',
          message: "Employee's new role:",
          choices: role.map(nRole => ({
            name: nRole.title,
            value: nRole.id
          }))
        },
        {
          type: 'list',
          name: 'manager_id',
          message: "Employee's new manager:",
          choices: employee.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id
          }))
        }
      ])
        .then(({ id, role_id, manager_id }) => {
          let update = {
            manager_id,
            role_id
          }

          db.query('UPDATE employee SET ? WHERE ?', [update, { id }], err => {
            if (err) {
              console.log(err)
            } else {
              console.log('Employee has been updated!')
              menu()
            }
          })
        })
        .catch(err => console.log(err))
    })
  })
}

menu()