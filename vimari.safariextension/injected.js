/*
 * Vimari injected script.
 *
 * This script is called before the requested page is loaded.  This allows us
 * to intercept events before they are passed to the requested pages code and
 * therefore we can stop certain pages (google) stealing the focus.
 */


/*
 * Global vars
 *
 * topWindow        - true if top window, false if iframe
 * settings         - stores user settings
 * currentZoomLevel - required for vimium scripts to run correctly
 * linkHintCss      - required from vimium scripts
 * extensionActive  - is the extension currently enabled (should only be true when tab is active)
 * shiftKeyToggle   - is shift key currently toggled
 */
var topWindow = (window.top === window),
	settings = {},
	currentZoomLevel = 100,
	linkHintCss = {},
	extensionActive = true,
	shiftKeyToggle = false;



/*
 * Initialise the extension
 */
function _init() {
	// Only add if topWindow... not iframe
	if (topWindow) {
		document.addEventListener('keydown', keyEvent, true);
		// Retrieve settings
		safari.self.tab.dispatchMessage('getSettings', '');
	}
}



/*
 * Handle key events
 */
function keyEvent(event) {
	var s = settings;

	console.log('Key event - ' + getKeyChar(event));

	if (linkHintsModeActivated || !event.ctrlKey || !extensionActive)
		return;

	console.log('Switching key event');
	event.stopPropagation();
	event.preventDefault();

	switch (getKeyChar(event)) {
		case s.hintToggle    :
					HUD.show('Link hints mode');
					activateLinkHintsMode(event.shiftKey, false);
				  	break;
		case s.tabForward    :
					safari.self.tab.dispatchMessage('changeTab', 1);
					break;
		case s.tabBack       :
					safari.self.tab.dispatchMessage('changeTab', 0);
					break;
		case s.scrollDown    :
					window.scrollBy(0, 60);
					break;
		case s.scrollUp      :
					window.scrollBy(0, -60);
					break;
	}


}



/*
 * Adds the given CSS to the page.
 * This function is required by vimium but depracated for vimari as the
 * css is pre loaded into the page.
 */
function addCssToPage(css) {
	return;
}



/*
 * Input or text elements are considered focusable and able to receieve their own keyboard events,
 * and will enter enter mode if focused. Also note that the "contentEditable" attribute can be set on
 * any element which makes it a rich text editor, like the notes on jjot.com.
 * Note: we used to discriminate for text-only inputs, but this is not accurate since all input fields
 * can be controlled via the keyboard, particuarlly SELECT combo boxes.
 */
function isEditable(target) {
  if (target.getAttribute("contentEditable") == "true")
    return true;
  var focusableInputs = ["input", "textarea", "select", "button"];
  return focusableInputs.indexOf(target.tagName.toLowerCase()) >= 0;
}



/*
 * Embedded elements like Flash and quicktime players can obtain focus but cannot be programmatically
 * unfocused.
 */
function isEmbed(element) { return ["EMBED", "OBJECT"].indexOf(element.tagName) > 0; }




// ==========================
// Message handling functions
// ==========================

/*
 * All messages are handled by this function
 */
function handleMessage(msg) {
	// Attempt to call a function with the same name as the message name
	switch(msg.name) {
		case 'setSettings':
			setSettings(msg.message);
			break;
		case 'setActive':
			setActive(msg.message);
			break;
	}
}



/*
 * Callback to pass settings to injected script
 */
function setSettings(msg) {
	settings = msg;
}

/*
 * Enable or disable the extension on this tab
 */
function setActive(msg) {

	extensionActive = msg;
	if(msg) {
		// Add event listener...
		console.log('Enabling Vimari for this tab');
		document.addEventListener('keydown', keyEvent, true);
	} else {
		console.log('Disabling Vimari for this tab');
		document.removeEventListener('keydown', keyEvent, true);
	}
}


// Add event listener and init
safari.self.addEventListener("message", handleMessage, false);
_init();

