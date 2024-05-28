//
//  Recognises a card and puts it into a div.

(function (extension) {
  if (typeof showdown !== 'undefined') {
    // global (browser or nodejs global)
    extension(showdown);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['showdown'], extension);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = extension(require('showdown'));
  } else {
    // showdown was not found so we throw
    throw Error('Could not find showdown library');
  }

}
(function (showdown) {
	showdown.extension('summary', function() {
		var myext2 = {
		type: 'output',
		regex: /<h4>((.|\n)+?)<\/h4>((.|\n)+?)<hr \/>/g,
		replace: '<details><summary>$1</summary>$3</details>'
		};
	return [myext2];
	});
}));
