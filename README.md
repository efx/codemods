# codemods

## supported

| should variant | qunit assert variant | 
| ------ | ------ |
| `aValue.should.be.true()` (false too) | `assert.true(aValue)` |
| `aValue.should.equal(1)`, `should.eql(1)`  | `assert.equal(aValue, 1)` |
| `aValue.should.not.equal(1)`  | `assert.notEqual(aValue, 1)` |
| `should.exist(aValue)`  | `assert.ok(aValue)` |
| `should.not.exist(aValue)`  | `assert.notOk(aValue)` |

