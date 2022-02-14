var MagicString = require('magic-string');
var bundle = new MagicString.Bundle();
bundle.addSource({
  filename: 'foo.js',
  content: new MagicString( 'var answer = 42;' )
});
bundle.addSource({
  filename: 'bar.js',
  content: new MagicString( 'console.log( answer )' )
});
bundle.indent() // optionally, pass an indent string, otherwise it will be guessed
  .prepend( '(function () {\n' )
  .append( '}());' );
console.log(bundle.toString()); 