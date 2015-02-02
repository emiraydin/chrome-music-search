// Parse all the Google search result links into an array
var res = document.getElementsByTagName('h3');
var searchResults = [];
for (var i = 0; i < 10; i++) {
	searchResults.push(res[i].children[0].href);
}

// Send the results back to the background script
chrome.runtime.sendMessage({
	results: searchResults
});
