const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
console.log('pres.shapes:', pres.shapes);
console.log('pptxgen.shapes:', pptxgen.shapes);
console.log('pres.shapes.PARALLELOGRAM:', pres.shapes ? pres.shapes.PARALLELOGRAM : 'undefined');
