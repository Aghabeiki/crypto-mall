/**
 * Created by roten on 7/14/17.
 */


module.exports = function (max, min, classification, rooms, cb) {
    let maxPoint = 100
    let minPoint = 0
    var Genetical = require('genetical');
    var populationFactory = function (populationLength, populationSize, randomGenerator, callback) {
        callback(null, {point: getRandomIt(maxPoint, minPoint, randomGenerator)});
    }
    var terminationCondition = function (stats) {
        return stats.generation >= 20
    }
    var fitnessEvaluator = function (candidate, callback) {
        let validRooms = classification(rooms, candidate.point, maxPoint);
        callback(null, Object.keys(validRooms).length);
    }
    var mutate = function (candidate, mutationProbability, randomGenerator, callback) {
        if (randomGenerator.random() < mutationProbability) {
            let floorPart = Math.floor(candidate.point);
            let nonFloor = candidate - floorPart;

            let mutateFloor = Math.floor(getRandomIt(maxPoint, nonFloor, randomGenerator));
            candidate.point = mutateFloor + nonFloor;
        }
        callback(candidate)
    }
    var crossover = function (parent1, parent2, points, randomGenerator, callback) {

        let a, b;
        if (parent1.score > parent2.score) {
            b = Math.floor(parent1.point) + getRandomIt(1, 0, randomGenerator);
            a = Math.floor(parent1.point) + getRandomIt(1, 0, randomGenerator);
        }
        else {
            b = Math.floor(parent2.point) + getRandomIt(1, 0, randomGenerator);
            a = Math.floor(parent2.point) + getRandomIt(1, 0, randomGenerator);
        }

        callback([{point: b}, {point: a}])

    }
    var getRandomIt = function (max, min, generator) {
        return (generator.random() * Math.abs((max - min + 1))) + min;
    }

    let initialPopulation = [];
    for (let i = 0; i < 10; i++) {
        initialPopulation.push({point: getRandomIt(maxPoint, minPoint, Math)})
    }

    var options = {
        populationSize: 10,
        populationFactory: populationFactory,
        terminationCondition: terminationCondition,
        fitnessEvaluator: fitnessEvaluator,
        natural: true,
        evolutionOptions: {
            crossover: crossover,
            mutate: mutate,
            mutationProbability: 0.1
        },
        islandOptions: {
            islands: 5,
            migration: 0.3,
            epoch: 10
        },
        seed: 2
    };

    var ga = new Genetical(options);

    var population;
    ga.on('initial population created', function (initialPopulation) {
        if (!population) {
            population = initialPopulation;
        }
    });
    ga.solve(function (bestCandidate, generation) {
        cb(bestCandidate.point);
    });

}
