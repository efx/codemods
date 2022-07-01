findAll('h2').length.should.equal(1);
this.element.textContent.trim().should.equal('/overview/executive');
updatedElem.position().should.eql({top: 0, left: 0});
