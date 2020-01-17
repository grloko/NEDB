const Datastore = require('nedb')
const nodes7 = require('nodes7')

const conn = new nodes7()

var db1 = new Datastore({ filename: './db1', autoload: true })

let variables = {
    var1: 'DB1,REAL0',
    var2: 'DB1,REAL4',
    var3: 'DB1,REAL8',
    var4: 'DB1,REAL12',
    var5: 'DB1,REAL16'
}

conn.initiateConnection(
    { port: 102, host: '192.168.100.15', rack: 0, slot: 1 },
    (err) => {
        if (err) {
            console.log('Error: ' + err)
            process.exit()
        }
        conn.setTranslationCB((tag) => {
            return variables[tag]
        })
        conn.addItems(['var1', 'var2', 'var3', 'var4', 'var5'])
        setInterval(() => {
            conn.readAllItems(valuesRead)
        }, 10000)
    }
)

function valuesRead(err, values) {
    if (err) console.log('Error: ' + err)
    values = Object.assign({ data: Date.now(), sent: false }, values)
    console.log('Valores lidos:\n    ' + JSON.stringify(values))
    db1.insert(values, (err, doc) => {
        if (err) console.log(err.message)
        console.log(
            'Valores inseridos no banco de dados:\n    ' + JSON.stringify(doc)
        )
    })
}

function sendServer() {
    db1.findOne({ sent: false }, (err, doc) => {
        if (err) console.log(err.message)
        else if (doc) {
            console.log('Dado pendente:\n    ' + JSON.stringify(doc))
            db1.update(
                { _id: doc._id },
                { $set: { sent: true } },
                {},
                (err) => {
                    if (err) console.log(err.message)
                }
            )
        } else {
            console.log('Nenhum dado pendente!')
        }
    })
}

setInterval(sendServer, 5000)
