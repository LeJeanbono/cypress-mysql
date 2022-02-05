# Cypress MySQL Plugin

![build](https://github.com/LeJeanbono/cypress-mysql/actions/workflows/ci.yml/badge.svg)
![cypress](https://img.shields.io/badge/Cypress-9.x-success)
![mysql](https://img.shields.io/badge/MySQL-5.7-blue)

## Query

```javascript
cy.query('SELECT * FROM myTable').then(datas => {
    // array object
})
```

```javascript
cy.query<MyObject>('SELECT * FROM myTable').then(datas => {
    // array MyObject
})
```

## SELECT

```javascript
// SELECT * FROM myTable
cy.selectAll({ table: 'myTable' }).then(datas => {
    // array object
})
```

```javascript
// SELECT * FROM myTable
cy.selectAll<MyObject>({ table: 'myTable' }).then(datas => {
    // array MyObject
})
```

## CREATE

## DROP

## DELETE

## INSERT
