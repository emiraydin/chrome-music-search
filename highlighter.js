// Highlights the given text
var highlight = function(text) {
    document.body.innerHTML = document.body.innerHTML.replace(
        new RegExp(text + '(?!([^<]+)?>)', 'gi'),
        '<b style="background-color:#ff0;font-size:100%">$&</b>'
    );
};

// When this script receives a message with a search term
// It highlights all the relevant words on the current page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	var terms = message.searchTerm.split(" ");
	terms.forEach(function(term) {
		highlight(term);
	});
	sendResponse();		
});