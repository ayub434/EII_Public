sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"incidentmanagement/incidentfree/test/integration/pages/IncidentsList",
	"incidentmanagement/incidentfree/test/integration/pages/IncidentsObjectPage",
	"incidentmanagement/incidentfree/test/integration/pages/Incidents_conversationObjectPage"
], function (JourneyRunner, IncidentsList, IncidentsObjectPage, Incidents_conversationObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('incidentmanagement/incidentfree') + '/test/flp.html#app-preview',
        pages: {
			onTheIncidentsList: IncidentsList,
			onTheIncidentsObjectPage: IncidentsObjectPage,
			onTheIncidents_conversationObjectPage: Incidents_conversationObjectPage
        },
        async: true
    });

    return runner;
});

