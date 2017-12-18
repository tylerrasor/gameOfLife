/*
 * Conway's Game of Life kata exercise
 * Author: Tyler Rasor
 * Date: 2017-12-18
 */
(function ($) {
    $.fn.gameOfLife = function(options) {
        // Used to control infinite-run mode
        var _run = false;
        var _runButton = null;
        var _gameBoardId = null;

        // Default settings, extended with passed in options
        var _settings = $.extend({
            'numCols':8,
            'numRows':6,
            'randomInitialState':false,
            '_runUnitTests':false
        }, options);



        /*
         * Checks that the actual result of the liveOrDie function matches the
         * expected result given the input parameters for current state.
         */
        function testLiveOrDieOnce(currentlyAlive, numAliveNeighbors, expectedResult) {
            var actualResult = liveOrDie(currentlyAlive, numAliveNeighbors);
            var testResult = 'liveOrDie: current cell ' + (currentlyAlive?'ALIVE':'DEAD');
            testResult += ' and ' + numAliveNeighbors + ' alive neighbors.';
            testResult += ' Expected: ' + (expectedResult?'ALIVE':'DEAD');
            testResult += ' Was: ' + (actualResult?'ALIVE':'DEAD');
            testResult += '\t\t\t' + (expectedResult==actualResult?'PASS :)':'FAIL :(');
            console.log(testResult);
        }

        /*
         * Perhaps the most important part of the project, the function which
         * determines the next state of a cell based on its current state and
         * neighbor's states.  There's only 16 possible combinations, test all.
         */
        function testLiveOrDie() {
            var alive = true;
            var dead = false;
            console.log('\n\nTesting liveOrDie:');
            testLiveOrDieOnce(alive,0,dead);
            testLiveOrDieOnce(alive,1,dead);
            testLiveOrDieOnce(alive,2,alive);
            testLiveOrDieOnce(alive,3,alive);
            testLiveOrDieOnce(alive,4,dead);
            testLiveOrDieOnce(alive,5,dead);
            testLiveOrDieOnce(alive,6,dead);
            testLiveOrDieOnce(alive,7,dead);
            testLiveOrDieOnce(alive,8,dead);
            testLiveOrDieOnce(dead,0,dead);
            testLiveOrDieOnce(dead,1,dead);
            testLiveOrDieOnce(dead,2,dead);
            testLiveOrDieOnce(dead,3,alive);
            testLiveOrDieOnce(dead,4,dead);
            testLiveOrDieOnce(dead,5,dead);
            testLiveOrDieOnce(dead,6,dead);
            testLiveOrDieOnce(dead,7,dead);
            testLiveOrDieOnce(dead,8,dead);
        }

        /*
         * Not really a true unit test, more of an integration test as it relies
         * on the results of buildGameBoard and buildGameControls.
         */
        function testInitOnce(options, expectedCols, expectedRows, expectedRandomAlive) {
            console.log('With options: ' + JSON.stringify(options));
            var errors = '';
            // Run on a test div so we don't enter infinite recursion loop
            var test = $('<div>').gameOfLife(options);
            // Both the columns and rows are generated in buildGameBoard,
            // so this isn't a true unit test - don't know how to decouple
            if ($(test).find('tr').length != expectedRows) {
                errors += 'Number of rows not generated properly. ';
            }
            if ($(test).find('td').length/$(test).find('tr').length != expectedCols) {
                errors += 'Number of columns not generated properly. ';
            }
            if ($(test).find('button').length != 2) {
                errors += 'Expected step and run buttons, but did not find.';
            }
            if (expectedRandomAlive && $(test).find('.alive').length == 0) {
                errors += 'Expected random living cells, but none. ';
            }
            if (!expectedRandomAlive && $(test).find('.alive').length > 0) {
                errors += 'Expected no randoms alive, but some.';
            }
            if (errors.length == 0) {
                console.log('PASS :)');
            } else {
                console.log('FAIL :(');
                console.log(errors);
            }
        }

        /*
         * Test that the gameboard is properly created given different initial
         * options from the user (or defaults).
         */
        function testInit() {
            console.log('\n\nTesting init:')
            var result = null;
            var options = {};
            testInitOnce(options, 8, 6, false);
            options['numCols'] = 5;
            testInitOnce(options, 5, 6, false);
            options['numRows'] = 10;
            testInitOnce(options, 5, 10, false);
            options['randomInitialState'] = true;
            testInitOnce(options, 5, 10, true);
            options['_runUnitTests'] = true;
            // Infinite recursion loop
        }

        /*
         * What few unit tests I could figure out how to implement.
         */
        function runTestSuite() {
            testLiveOrDie();
            testInit();
            // toggleRun will only produce one result without fully init-ed
            // state and living cells on the board - likewise for runForward
            // and stepForward because everything is dead, no updates needed
        }



        /*
         * Flip the run mode and update the run button's label to match.
         */
        function toggleRun() {
            _run = !_run;
            if (_run) {
                $(_runButton).text('Stop');
                runForward();
            } else {
                $(_runButton).text('Run');
            }
        }

        /*
         * If the user has requested infinite-run mode, we alternate between
         * calling stepForward and 250ms of sleep until the user cancels run
         * mode or no new updates were made.
         */
        function runForward() {
            if (_run && $('#' + _gameBoardId).length > 0) {
                stepForward();
                setTimeout(function() {runForward();}, 250);
            }
        }

        /*
         * Decides if a cell lives or dies in the next generation based on its
         * current state, and the number of living neighbor cells.
         * Rules for next state:
         * 1. Any live cell with fewer than two neighbors dies.
         * 2. Any live cell with more than three live neighbors dies.
         * 3. Any live cell with two or three live neighbors lives.
         * 4. Any dead cell with exactly three neighbors becomes alive.
         */
        function liveOrDie(currentlyAlive, numAliveNeighbors) {
            var nextState = false;
            // Based on these rules, we can ignore anything other than 2 or 3.
            // For 2, we preserve state (dead if dead, alive if alive).
            if (numAliveNeighbors == 2) {
                nextState = currentlyAlive;
            }
            // For 3 neighbors, we will always be alive next generation.
            if (numAliveNeighbors == 3) {
                nextState = true;
            }
            return nextState;
        }

        /*
         * Process one generation of updates.  First determine the current state
         * of a cell and its neighbors, storing temporarily, then update the UI.
         */
        function stepForward() {
            var updateMade = false;
            var nextState = [];
            // Since we allow the user to make changes to the game board at any
            // time, we have to pull the state from the UI before running the
            // update step and applying the changes back to the UI
            for (var i=0; i < _settings.numRows; i++) {
                nextState.push([]);
                for (var j=0; j < _settings.numCols; j++) {
                    // Check the eight (potential) neighbors
                    var numAliveNeighbors = 0;
                    // The beauty of storing the state in the DOM and accessing
                    // via jQuery indexing is that we don't need to worry about
                    // out of index - the element with id correspdonding to
                    // (-1,-1) for example just doesn't exist, so is treated as
                    // dead because the hasClass function returns a boolean.
                    // And since we get a boolean back, we can implicitly cast
                    // to int and keep a running sum of alive neighbors.
                    numAliveNeighbors += $('#'+(i-1)+'_'+(j-1)).hasClass('alive');
                    numAliveNeighbors += $('#'+(i-1)+'_'+j).hasClass('alive');
                    numAliveNeighbors += $('#'+(i-1)+'_'+(j+1)).hasClass('alive');
                    numAliveNeighbors += $('#'+i+'_'+(j-1)).hasClass('alive');
                    numAliveNeighbors += $('#'+i+'_'+(j+1)).hasClass('alive');
                    numAliveNeighbors += $('#'+(i+1)+'_'+(j-1)).hasClass('alive');
                    numAliveNeighbors += $('#'+(i+1)+'_'+j).hasClass('alive');
                    numAliveNeighbors += $('#'+(i+1)+'_'+(j+1)).hasClass('alive');
                    var currentState = $('#'+i+'_'+j).hasClass('alive');
                    nextState[i].push(liveOrDie(currentState, numAliveNeighbors));
                    if (!updateMade && currentState != nextState[i][j]) {
                        updateMade = true;
                    }
                }
            }
            // If an update is needed, push it to the UI
            if (updateMade) {
                for (var i=0; i < _settings.numRows; i++) {
                    for (var j=0; j < _settings.numCols; j++) {
                        $('#'+i+'_'+j).removeClass('alive');
                        if (nextState[i][j]) {
                            $('#'+i+'_'+j).addClass('alive');
                        }
                    }
                }
            } else if (_run) {
                // In case the user had set the run and walked away
                toggleRun();
            }
        }

        /*
         * Build the game board as an HTML table and set it on the target of
         * this plugin.  We'll also initialize a random state here (if requested),
         * and set the css styles so that this plugin is self-contained.
         *
         * With more time (or for a more permanent solution) I would explore
         * using HTML5 canvas, but I think that's beyond the scope of what this
         * assignment is supposed to demonstrate.
         */
        function buildGameBoard(cellHeight, cellWidth) {
            var table = $('<table>').css('border-collapse','collapse');
            var defaultCell = $('<td>').css({
                'height':cellHeight,
                'width':cellWidth,
                'border':'thin solid grey'
            });
            var defaultRow = $('<tr>');
            for (var i=0; i < _settings.numRows; i++) {
                var row = $(defaultRow).clone();
                for (var j=0; j < _settings.numCols; j++) {
                    // For UI update purposes, we set the id to the concatenated
                    // indices of this cell's location
                    var cell = $(defaultCell).clone().attr('id',i+'_'+j);
                    // Callback for click event to toggle alive/dead
                    $(cell).on('click', function() {
                        this.classList.toggle('alive');
                    });
                    // Init to a random state if requested
                    // Math.random returns [0-1), so 0.5 should give us half
                    // alive and half dead cells
                    if (_settings.randomInitialState && Math.random() > 0.5) {
                        $(cell).addClass('alive');
                    }
                    row.append(cell);
                }
                table.append(row);
            }
            $('<style>').prop('type','text/css').html('.alive{background:green;}').appendTo('head');
            return table;
        }

        /*
         * Create buttons so that the user can trigger state changes.
         */
        function buildGameControls() {
            // Just add two buttons to "step once" and "run indefinitely"
            var buttonRow = $('<div>');
            var stepButton = $('<button>').text('Step once').on('click', function() {
                stepForward();
            });
            buttonRow.append(stepButton);
            _runButton = $('<button>').text('Run').on('click', function() {
                toggleRun();
            });
            buttonRow.append(_runButton);
            return buttonRow;
        }

        /*
         * Build the gameboard and attach it to the target of this plugin.
         */
        function init(target) {
            // On init, remove any existing board or text from the target div
            $(target).empty();
            // Since this project was implemented as a jQuery plugin (for
            // portability and other reasons), all internal functions are
            // anonymous/unreachable to the outside world.  This is great if
            // we don't want anyone messing with our running project, but
            // makes unit testing with an outside framework impossible.  We've
            // included rudamentary manual unit testing instead.
            if (_settings._runUnitTests) {
                $(target).text('Running unit tests. Check console for output.');
                runTestSuite();
            } else {
                // Since we're using jQuery to build the DOM elements (which is slow
                // and/or expensive), we'll set a hard cap on the size of the table
                // at 50x50.  Alert the user if they request more than that.
                if (_settings.numRows > 50 || _settings.numCols > 50) {
                    var warningStr = 'I\'m using jQuery to create DOM elements, which is really slow.\n';
                    warningStr += 'Purposefully restricted to 50x50.';
                    alert(warningStr);
                    return;
                } else if (_settings.numRows <= 0 || _settings.numCols <= 0) {
                    alert('A table that size just doesn\'t make sense - try again.');
                    return
                }
                // Max out the available display space
                var cellHeight = target.height() / _settings.numRows;
                var cellWidth = target.width() / _settings.numCols;
                _gameBoardId = 'gameBoard_'+$.now();
                var container = $('<div>').attr('id',_gameBoardId);
                var gameBoard = buildGameBoard(cellHeight, cellWidth);
                container.append(gameBoard);
                var gameControls = buildGameControls();
                container.append(gameControls);
                $(target).append(container);
            }
        }



        init(this);
        // For chaining purposes, return this.
        return this;
    };
}(jQuery));
