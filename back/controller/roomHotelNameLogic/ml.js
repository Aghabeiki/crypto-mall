/**
 * Created by roten on 7/10/17.
 */
var limdu = require('limdu');

let ml = function (trainset, targetList) {
    // First, define our base classifier type (a multi-label classifier based on winnow):
    var TextClassifier = limdu.classifiers.multilabel.BinaryRelevance.bind(0, {
        binaryClassifierType: limdu.classifiers.Winnow.bind(5, {retrain_count: 30})
    });

// Now define our feature extractor - a function that takes a sample and adds features to a given features set:
    var WordExtractor = function (input, features) {
        input.split(" ").forEach(function (word) {
            features[word] = 1;
        });
    };

// Initialize a classifier with the base classifier type and the feature extractor:
    var intentClassifier = new limdu.classifiers.EnhancedClassifier({
        classifierType: TextClassifier,
        featureExtractor: WordExtractor
    });

// Train and test:
    intentClassifier.trainBatch(trainset);


    calc = function (str) {
        let tmp = intentClassifier.classify(str.roomName.toLowerCase());
        let test = {roomName: str.roomName, roomID: str.roomID, catInfo: []}
        if (tmp.length != 0)
            test.catInfo = tmp;
        return test
    }
    return targetList.map(calc)
}


process.on('message', function (mlProcessingData) {
    "use strict";
    process.send(ml(mlProcessingData.trainset, mlProcessingData.targetList))
});
