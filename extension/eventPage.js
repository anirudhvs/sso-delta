var date = null;
var backend = "http://localhost:8000";
chrome.storage.sync.get(["olddate", "name", "rollno"], (fetch) => {
	date = new Date(fetch.olddate);
	if (!fetch.olddate || Date.now() - date > 8640) {
		chrome.storage.sync.set({ olddate: Date.now() }, () => {
			var notifications;
			console.log(date);
			$.get(`${backend}/fetchevents/${fetch.name}/${fetch.rollno}`)
				.done((data) => {
					notifications_length = data;
					if (notifications_length) {
						var notifOptions = {
							type: "basic",
							iconUrl: "icon/icon48.png",
							title: "Remainders from delta",
							message: `You have ${notifications_length} remaining to be marked as read.`,
							isClickable: true,
						};
						chrome.notifications.create("remind", notifOptions);
						chrome.notifications.onClicked.addListener(() => {
							chrome.tabs.create(
								{
									url: `${backend}/events/${fetch.name}/${fetch.rollno}`,
									active: true,
								},
								function (tab) {
									chrome.windows.create({
										tabId: tab.id,
										focused: true,
									});
								}
							);
						});
					}
				})
				.fail((xhr, status) => console.log("error:", status));
		});
	}
});
chrome.storage.sync.get(["name", "rollno"], function (user) {
	if (user.name && user.rollno) {
		var ToDelta = {
			id: "ToDelta",
			title: "ToDelta",
			contexts: ["selection"],
		};

		var Personal = {
			id: "Personal",
			title: "Personal",
			contexts: ["selection"],
		};

		chrome.contextMenus.create(Personal);
		chrome.contextMenus.create(ToDelta);

		chrome.contextMenus.onClicked.addListener(function (clickData) {
			if (clickData.menuItemId == "ToDelta" && clickData.selectionText) {
				chrome.tabs.query(
					{ active: true, lastFocusedWindow: true },
					(tabs) => {
						chrome.storage.sync.set({ url: tabs[0].url });
					}
				);
				chrome.storage.sync.set({
					content: clickData.selectionText,
				});
				window.open(
					"toDelta.html",
					"extension_popup",
					"width=500,height=500,status=no,scrollbars=yes,resizable=no"
				);
			}
			if (clickData.menuItemId == "Personal" && clickData.selectionText) {
				chrome.tabs.query(
					{ active: true, lastFocusedWindow: true },
					(tabs) => {
						chrome.storage.sync.set({ url: tabs[0].url });
					}
				);
				chrome.storage.sync.set({
					content: clickData.selectionText,
				});
				window.open(
					"Personal.html",
					"extension_popup",
					"width=500,height=500,status=no,scrollbars=yes,resizable=no"
				);
			}
		});
	}
});
