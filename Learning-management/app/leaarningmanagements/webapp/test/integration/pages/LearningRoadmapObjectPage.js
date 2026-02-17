sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'lm.learningmanagement.leaarningmanagements',
            componentId: 'LearningRoadmapObjectPage',
            contextPath: '/LearningRoadmap'
        },
        CustomPageDefinitions
    );
});