sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"lm/learningmanagement/leaarningmanagements/test/integration/pages/LearningRoadmapList",
	"lm/learningmanagement/leaarningmanagements/test/integration/pages/LearningRoadmapObjectPage",
	"lm/learningmanagement/leaarningmanagements/test/integration/pages/LearningRoadmapModulesObjectPage"
], function (JourneyRunner, LearningRoadmapList, LearningRoadmapObjectPage, LearningRoadmapModulesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('lm/learningmanagement/leaarningmanagements') + '/test/flp.html#app-preview',
        pages: {
			onTheLearningRoadmapList: LearningRoadmapList,
			onTheLearningRoadmapObjectPage: LearningRoadmapObjectPage,
			onTheLearningRoadmapModulesObjectPage: LearningRoadmapModulesObjectPage
        },
        async: true
    });

    return runner;
});

