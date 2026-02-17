sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"learningcertificates/learningcertificates/test/integration/pages/MyCertificationsMain"
], function (JourneyRunner, MyCertificationsMain) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('learningcertificates/learningcertificates') + '/test/flp.html#app-preview',
        pages: {
			onTheMyCertificationsMain: MyCertificationsMain
        },
        async: true
    });

    return runner;
});

