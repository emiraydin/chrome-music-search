// Functions to inject content scripts to the given tab
var injectGoogleParser = function(tab) {
	chrome.tabs.executeScript(tab.id, { file: 'googleParser.js', runAt: 'document_end' });
};
var injectHighlighter = function(tab) {
	chrome.tabs.executeScript(tab.id, { file: 'highlighter.js', runAt: 'document_end' }, function(results) {
		chrome.tabs.sendMessage(tab.id, {
	  		searchTerm: localStorage.getItem("searchTerm"),
	  		}
	  	);
	});
};

// Redirects the current tab to the given URL
var redirectToURL = function(url) {
	// clear existing variables for injection
	localStorage.removeItem("searchTab");
	localStorage.removeItem("searchResultTab");
	// redirect tab and set new variables for injection
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if (/google.com/i.test(url))
			localStorage.setItem("searchTab", tabs[0].id);
		else
			localStorage.setItem("searchResultTab", tabs[0].id);
		chrome.tabs.update(tabs[0].id, {url: url});
	});

};

// Redirects to Google search based on user input
var runSearch = function() {
	var title = document.getElementById('search').value;
	localStorage.setItem("searchTerm", title);
	var term = title.replace(' ', '+');
	var prefix = "intitle:index.of+(mp3)+";
	var searchItem = prefix + term;
	var url = "http://google.com/search?q=" + searchItem;
	redirectToURL(url);
};

// Navigate to the search result with given index
var navigateToResult = function(which) {
	var index = parseInt(localStorage.getItem("currentIndex"));
	if (which === "previous")
		index = (index - 1 < 0) ? 9 : index - 1;
	else // type === "next"
		index = (index + 1 > 9) ? 0 : index + 1;
	localStorage.setItem("currentIndex", index);
	var results = JSON.parse(localStorage.getItem("musicResults"));
	redirectToURL(results[index]);
};

// Updates DOM elements based on user input
var updateDOMOnInput = function() {
	// If the search input is the same as the current search term
	// then show next and previous buttons, otherwise hide them
	if (document.getElementById('search').value != localStorage.getItem("searchTerm")) {
		document.getElementById('search').style.width = '296px';
		document.getElementById('next').style.display = 'none';
		document.getElementById('previous').style.display = 'none';
	} else {
		document.getElementById('search').style.width = '220px';
		document.getElementById('next').style.display = 'block';
		document.getElementById('previous').style.display = 'block';
	}	
};

// Define all the DOM events to be fired once the window is loaded
window.addEventListener('load', function(e) {

	// If there is an existing search term, put it into the search box
	var searchTerm = localStorage.getItem("searchTerm");
	if (searchTerm)
		document.getElementById('search').value = searchTerm;

	// If the search box is not empty run search, otherwise alert the user
	document.getElementById('searchform').onsubmit = function() {
		if (document.getElementById('search').value === '')
			alert('Please enter a song or artist name.');
		else
			runSearch();
	};

	document.getElementById('searchform').oninput = updateDOMOnInput;
	document.getElementById('next').onclick = function() {
		navigateToResult("next");
	};
	document.getElementById('previous').onclick = function() {
		navigateToResult("previous");
	};

});

// Whenever a tab completes redirection, inject appropriate scripts
chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	var isSearchTab = localStorage.getItem("searchTab") == tabID;
	var isSearchResultTab = localStorage.getItem("searchResultTab") == tabID;
	if (isSearchTab && changeInfo.status === "complete")
		injectGoogleParser(tab);
	if (isSearchResultTab && changeInfo.status === "complete")
		injectHighlighter(tab);
});

// Once the search results are received, save them and redirect to the first one
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	localStorage.setItem("musicResults", JSON.stringify(message.results));
	localStorage.setItem("currentIndex", 0);
	redirectToURL(message.results[0]);
	sendResponse();
});
