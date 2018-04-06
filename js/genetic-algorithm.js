//////////////////////////////////////////
// Hamiltonian Circuit by Mohamed ALami //
//////////////////////////////////////////

/*
  Reference points in the graph for the first example
  ---------------------------------------------------
  0: Paris
  1: Lyon
  2: Bordeaux
  3: Toulouse
  4: Limoges
*/

// CONFIGURATION
var debug = true; // Mode debug
var isMinimizing = true; // Minimizing or maximizing ?
var startPoint = 4; // // Starting point and returning point (4: Limoges)
var numPopulation = 10; // Number of individuals in the first generation
var generationIndividuals = []; // The individuals of current generation
var generationFitness = []; // The fitnesses of the individuals
var generationPercentage = []; // Percentage of the fitness in the russian roulette
var eliminationRate = .2; // Rate of eliminiation
var numGenerations = 10; // Number of Generations
var points = [0, 1, 2, 3, 4];
var bestFitness = null;
var bestIndividual = null;
var bestGeneration = null;
var indexGeneration = null;
var Graph = [ // First example of noted graph
  [0,466,590,676,400],
  [466,0,556,538,412],
  [590,556,0,245,227],
  [676,538,245,0,291],
  [400,412,227,291,0],
];

function debugMessage(msg) {
  if(debug)
    console.log(msg);
}

function debugSeperator() {
  if(debug)
    console.log("----------------------------------------------------------------");
}

// Generate a number between min and max // source from: W3School
function Random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// Rounding float number // source from: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Math/round
function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

// Calculats the fitness of a giving individual
function Fitness(individual) {
  fitness = 0;
  for (var i = 0; i < individual.length-1; i++)
    fitness += Graph[individual[i]][individual[i+1]];

  return fitness;
}

// Generate one individual
function GenerateIndividual() {
  var individual = []; // Initiate a Hamiltonian circuit
  var rand; // Prepare var for the random point
  individual.push(startPoint); // Add startPoint
  for (var i = 0; i < Graph.length - 1; i++) {
    do {
      rand = Random(0, Graph.length - 1); // Generate a number within the nodes
    } while(individual.indexOf(rand) !== -1); // Generate until it doesn't belong already to the circuit
    individual.push(rand); // Add it
  }
  individual.push(startPoint); // Add startPoint
  // Returning the final circuit (individual)
  return individual;
}

// Generate first population
function GenerateFirstPopulation(){

  // Just some decoration messages
  debugMessage("#Hamiltonian Circuit with genetic algorithm. By Mohamed Alami");
  debugSeperator();
  debugMessage("Generating first generation")
  debugSeperator();

  for (var i = 0; i < numPopulation; i++) {
    var individual; // Prepare var for the random individual
    do {
      individual = GenerateIndividual(); // Generate random individual
    } while(generationIndividuals.indexOf(individual) !== -1); // Generate until it doesn't belong already to the circuit
    generationIndividuals.push(individual); // Add the individual
    generationFitness.push(Fitness(individual)); // Add it's fitness
  }
  debugMessage("#Individuals:");
  debugMessage(generationIndividuals);
  debugMessage("#Fitness:");
  debugMessage(generationFitness);
  }


// Russian Roulette @Deprecated
/* function RussianRoulette_old() {
  var maxFitness = generationFitness.reduce(function(a, b) { return Math.max(a, b); }, 0); // The max of all the fitnesses
  var aboveMaxFitness = ((Math.floor(maxFitness / 1000)) + 1)*1000;

  for (var i = 0; i < generationFitness.length; i++)
    generationPercentage.push(aboveMaxFitness - generationFitness[i]);

  var totalFitness = generationPercentage.reduce(function(a, b) { return a + b; }, 0);

  for (var i = 0; i < generationFitness.length; i++)
    generationPercentage[i] = precisionRound(generationPercentage[i] / totalFitness, 3);
} */

// Russian Roulette
function RussianRoulette() {
  debugSeperator();
  debugMessage("#Roussian Roulette:");

  // Flushing the array of the percentage before use
  generationPercentage = [];

  // Cal the sum of all the fitnesses
  var sum = generationFitness.reduce(function(a, b) { return a + b; }, 0);

  // Push each value with the percentage
  for (var i = 0; i < generationFitness.length; i++)
    generationPercentage.push(precisionRound(generationFitness[i] / sum, 3));

  debugMessage(generationPercentage);
  debugMessage("Total of percentages: " + VerificationPercentage());
}


// Verification of the percentage
function VerificationPercentage() {
  return generationPercentage.reduce(function(a, b) { return a + b; }, 0);
}


// Elimination
function Elimination() {
  debugSeperator();
  debugMessage("#Elimination:");
  if(VerificationPercentage() < .9) {
    debugMessage("ERROR: The total percentage is pretty low. Should be at least 0.9! [Current: " + VerificationPercentage() + "]");
  } else {
    var numIndividualToEliminate = numPopulation * eliminationRate;
    debugMessage(numIndividualToEliminate + " individuals will be eliminted");
    for (var e = 0; e < numIndividualToEliminate; e++) {
      var randomPercentageToAchieve = Math.random(); // Random percentage between 0 and 1
      debugMessage("The individual at "+ randomPercentageToAchieve + "% is set to be eliminted");
      var percentageAchieved = 0.0; // Progress of percentage achieved
      var selectedIndividual = 0; // Index of the selected individual
      for (var i = 0; i < generationPercentage.length; i++) {
        percentageAchieved += generationPercentage[i];
        if(randomPercentageToAchieve <= percentageAchieved) {
          selectedIndividual = i;
          break;
        }
      }
      if(isMinimizing) { // If we're minimizing (trying to seach the min value): we need to eliminate individual with the most %
        generationPercentage.splice(selectedIndividual, 1);
        generationFitness.splice(selectedIndividual, 1);
        generationIndividuals.splice(selectedIndividual, 1);
        debugMessage(selectedIndividual + " is eliminated");
      }  // TODO: If we're maximizing (trying to seach the max value): we need to eliminate individual with the least %
    }
  }
}

// Checking function: check wether the individual is valid (contains a valid circuit)
function Checking(individual) {

  // Checking starting points and returning point
  if(individual[0] != startPoint || individual[individual.length-1] != startPoint) {
    debugMessage("WARNING !!! The startpoint of the crossed individual is invalid!");
    return false;
  }

  // Searching for recurrent points
  for (var i = 1; i < individual.length - 1; i++)
    for (var j = i+1; j < individual.length - 1; j++)
      if(individual[i] == individual[j]) {
        individual.splice(i, 1);
        debugMessage("WARNING !!! Recurrent point detected & removed!");
      }

  // Looking for missing points
  for (var i = 0; i < points.length; i++) {
    // Ignoring starting point
    if(points[i] == startPoint)
      continue;

    // Assuming the point doesn't exist
    isExists = false;

    // Searching the point existence in the circuit
    for (var j = 1; j < individual.length - 1; j++)
      if(points[i] == individual[j]) {
        isExists = true;
        break;
      }

    if(!isExists) {
      individual.splice(Math.floor(individual.length/2), 0, points[i]);
      debugMessage("WARNING !! Missing point found and add in the middle of the circuit!");
    }
  }

  // Checking if the size is valid
  if(individual.length != points.length+1) {
    debugMessage("WARNING !!! The size of the crossed individual is invalid!");
    return false;
  }

  // If after all we had no false, then the individual is valid
  return true;
}

// Mutation function
function Mutation(individual) {
  debugSeperator();
  debugMessage("# Mutation");

  var randomIndex = Random(1, (individual.length - 2));
  debugMessage("Mutating at "+ randomIndex);
  var tmp = individual[randomIndex];
  individual[randomIndex] = individual[randomIndex+1];
  individual[randomIndex+1] = tmp;

  return individual;
}

// Crossing two individuals
function Crossing(firstIndividual, secondIndividual) {
  debugMessage("firstIndividual: "+ firstIndividual);
  debugMessage("secondIndividual: "+ secondIndividual);

  var halfGenome = Math.floor(firstIndividual.length/2);
  var individual = []; // Prepare the crossed individual

  // Building the crossed individual
  for (var i = 0; i < firstIndividual.length; i++)
    if (i < halfGenome)
      individual.push(firstIndividual[i]); // 50% of the first individual
    else
      individual.push(secondIndividual[i]); // 50% of the second individual

  // Mutation
  individual = Mutation(individual);

  // Checking the individual & correcting the individual
  if(Checking(individual)) {
      debugMessage("Crossed individuel : " + individual);
      return individual;
  }
  else {
    debugMessage("WARNING: The individual ["+individual+"] generated is not valid!");
    return GenerateIndividual();
  }
}

// Next Generation
function NextGeneration() {
  // Executing Russian Roulette
  RussianRoulette();

  // Executing Elimination
  Elimination();

  // Generating new individuals for the new generation
  debugSeperator();
  debugMessage("# Crossing");
  // Number of new individuals
  var numNewIndividuals = numPopulation * eliminationRate;
  for (var i = 0; i < numNewIndividuals; i++) {
    var individual; // Prepare var for the new individual

      var randomFirstIndividual = Random(0, Math.floor(numPopulation/2));
      var randomSecondIndividual = Random(Math.floor(numPopulation/2), numPopulation);
      debugMessage("Going to cross individual at "+randomFirstIndividual+" with "+randomSecondIndividual);
      individual = Crossing(generationIndividuals[i], generationIndividuals[i+1]); // Generate an individual from crossing

    generationIndividuals.push(individual); // Add the individual
    generationFitness.push(Fitness(individual)); // Add it's fitness
  }

    debugMessage("# New generation:");
    debugMessage(generationIndividuals);
    debugMessage(generationFitness);

}

function LastBestFitness(){
  if(isMinimizing)
    return Math.min.apply(null, generationFitness);
  else
    return Math.max.apply(null, generationFitness);
}

function updateBest(best){
  bestFitness = best;
  bestIndividual = generationIndividuals[generationFitness.indexOf(best)];
  bestGeneration = indexGeneration;
  debugMessage("Better or equal fitness found & updated : "+ best);
}

function BestFitness(){
  debugSeperator();
  debugMessage("# Best fitness :");

  if(bestFitness == null) {
    debugMessage("Initiating best fitness")
    updateBest(LastBestFitness());
  } else {
    if(isMinimizing) {
      if(bestFitness > LastBestFitness())
        updateBest(LastBestFitness());
    } else {
      if(bestFitness < LastBestFitness())
        updateBest(LastBestFitness());
    }
  }



  debugMessage("Best fitness so far : "+bestFitness);
}



function GeneticAlgorithm() {

  // Executing the generation of the first population
  GenerateFirstPopulation();

  // Next Generations
  for (var i = 0; i < numGenerations; i++) {
    indexGeneration = i;
    debugSeperator();
    debugMessage("### NEW GENERATION: "+ i);
    NextGeneration();
    BestFitness();
  }

  // Results
  debugSeperator();
  debugMessage("### RESULTS:");
  var lastBestFitness = LastBestFitness();
  if(bestFitness == lastBestFitness) {
    debugMessage("Best Individual: [" + bestIndividual+"] with the fitness of " + bestFitness + " found since the generation #" + bestGeneration);
  } else {
    debugMessage("Last Best Individual: [" + generationIndividuals[generationFitness.indexOf(lastBestFitness)]+"] with the fitness of " + lastBestFitness);
    debugMessage("Real Best Individual: [" + bestIndividual+"] with the fitness of " + bestFitness + " found in the generation number " + bestGeneration);
  }
}
