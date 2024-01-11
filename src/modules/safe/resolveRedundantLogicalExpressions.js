/**
 * Remove redundant logical expressions which will always resolve in the same way.
 * E.g.
 * if (false && ...) do_a(); else do_b(); ==> do_b();
 * if (... || true) do_c(); else do_d(); ==> do_c();
 * @param {Arborist} arb
 * @param {Function} candidateFilter (optional) a filter to apply on the candidates list
 * @return {Arborist}
 */
function resolveRedundantLogicalExpressions(arb, candidateFilter = () => true) {
	for (let i = 0; i < arb.ast.length; i++) {
		const n = arb.ast[i];
		if (n.type === 'IfStatement' &&
		n.test.type === 'LogicalExpression' &&
		    candidateFilter(n)) {

			if (n.test.operator === '&&') {
				if (n.test.left.type === 'Literal') {
					if (n.test.left.value) {
						arb.markNode(n.test, n.test.right);
					} else {
						arb.markNode(n.test, n.test.left);
					}
				} else if (n.test.right.type === 'Literal') {
					if (n.test.right.value) {
						arb.markNode(n.test, n.test.left);
					} else {
					    var loc = n.parentNode.body.findIndex(t => t === n);
					    if(loc !== -1){
						var newif = { ...n,
							  test: n.test.right,
							}
						var new_node = {
						    ...n.parentNode,
						    body: [
							...n.parentNode.body.slice(0,loc),
							n.test.left,
							newif,
							...n.parentNode.body.slice(loc+1),
						    ],
						};
						arb.markNode(n.parentNode, new_node);
					    }
					}
				}
			} else if (n.test.operator === '||') {
				if (n.test.left.type === 'Literal') {
					if (n.test.left.value) {
						arb.markNode(n.test, n.test.left);
					} else {
						arb.markNode(n.test, n.test.right);
					}
				} else if (n.test.right.type === 'Literal') {
				    if (n.test.right.value) {
					var loc = n.parentNode.body.findIndex(t => t === n);
					if(loc !== -1){
					    var newif = { ...n,
							  test: n.test.right,
							}
						var new_node = {
						    ...n.parentNode,
						    body: [
							...n.parentNode.body.slice(0,loc),
							n.test.left,
							newif,
							...n.parentNode.body.slice(loc+1),
						    ],
						};
						arb.markNode(n.parentNode, new_node);
					    }
					} else {
						arb.markNode(n.test, n.test.left);
					}
				}
			}
		}
	}
	return arb;
}

module.exports = resolveRedundantLogicalExpressions;
