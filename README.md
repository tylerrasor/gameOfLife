Conway's Game of Life kata exercise
Author: Tyler Rasor
Date: 2017-12-18

To Run:
    Open gameOfLife.html in a browser with active javascript and network access
    to Google's CDN (for jQuery library).  Hit 'GO' to launch the game board
    with default parameters, or input custom size and/or random initial state.
    Once launched, clicking a cell will flip its state (alive to dead or dead
    to alive).  The 'Step once' button will advance the game state one
    generation, and the 'Run' button will advance through generation updates
    automatically until stopped or an equilibrium is met.

Additional features:
    It made sense to generalize the size of the game board, so we gave the user
    the ability to input an abitrary size.  I wanted to see crazy patterns, so
    I added the ability to randomize the starting state and then step through
    generation without intervention (i.e. run indefinitely).

Testing:
    Unit testing is (by far) my biggest weakness - I have encountered little
    more than 'testing 101' level examples in my past experience.  I spent a
    considerable amount of time looking into javascript testing frameworks,
    and so many of them required some other dependancy (mostly Node.js) that
    made them seem so overly bloated for this toy example.  I wanted to keep
    things as minimal as possible.  Additionally, because I implemented this as
    a jQuery plugin all of the 'internals' are anonymous and not callable from
    outside the plugin scope.  Obviously, it's a benefit in many ways to hide
    access to these functions, but it made writing unit tests difficult.  I
    chose to include a 'hidden' initialization option to kick off a manual test
    process instead of actually creating the plugin.

Design choices:
    Deciding on the 'right tool for the job' is always an imporant part of any
    project.  Not knowing the end goal/use of this component, I chose to
    implement this as a jQuery plugin.  It felt like the right mix of 'quick
    proof of concept', 'visually pleasing', and 'reuseable in the future'.
    If, for example, we had planned on using this algorithm to compute game
    state for massive board sizes in a high performance context, the right
    solution probably would have been C++ and then offloading the parallelizable
    next state compute step to GPU via CUDA (or something similar).

To use in another project:
    Built as a jQuery plugin, there are currently four options that can be
    passed in on initialization:
        numCols: type - int, default - 8
        numRows: type - int, default - 6
        randomInitialState: type - boolean, default - false
        runUnitTests: type - boolean, default - false
    Options are passed as with any other jQuery plugin, e.g.:
        $('div').gameOfLife({'randomInitialState':true});
