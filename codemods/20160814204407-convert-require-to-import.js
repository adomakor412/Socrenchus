/**
 * converts commonJS requires to es6 imports
 *   var foo = require('foo');
 * ->
 *   import foo from 'foo';
*/
function isTopLevel(path) {
  return !path.parentPath.parentPath.parentPath.parentPath;
}

module.exports = {
  transform: ({file, root, api, options}) => {
    const j = api.jscodeshift;

    const printOptions = options.printOptions || {};

    root
      .find(j.VariableDeclaration, {
        declarations: [{
          type: 'VariableDeclarator',
          init: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'require',
            },
          },
        }],
      })
      .filter(isTopLevel)
      .forEach(function(path) {
        const dec = path.value.declarations[0];
        const id = dec.id;
        const source = dec.init.arguments[0];
        const comments = path.value.comments;
        const loc = path.value.loc;
  
        path.replace(
          j.importDeclaration(
            [{
              type: 'ImportDefaultSpecifier',
              id
            }],
            source
          )
        );
        path.value.loc = loc;
        path.value.comments = comments;
      });
  
    root
      .find(j.VariableDeclaration, {
        declarations: [{
          type: 'VariableDeclarator',
          init: {
            type: 'MemberExpression',
            object: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'require'
              },
            },
          },
        }],
      })
      .filter(isTopLevel)
      .forEach(function(path) {
        const dec = path.value.declarations[0];
        const name = dec.id;
        const source = dec.init.object.arguments[0];
        const id = dec.init.property;
        const comments = path.value.comments;
        const loc = path.value.loc;
  
        let spec = {
          type: 'ImportSpecifier',
          id,
        }
        if (name.name !== id.name) {
          spec['name'] = name;
        }
  
        path.replace(j.importDeclaration([spec], source));
        path.value.loc = loc;
        path.value.comments = comments;
      });
      
    const didTransform = true;
    
    return {
      didTransform,
      root,
      printOptions
    };
  }
}
