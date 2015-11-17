// add game detail Collection
Games = new Mongo.Collection('games');

// add player routes
Router.route('/player1', function () {
  this.render('player', {data: {player: 1}});
});
Router.route('/player2', function () {
  this.render('player', {data: {player: 2}});
});

if (Meteor.isClient) {
  Meteor.call('initializeGame');

  Template.player.helpers({
    winner: function () {
      var result = Games.find().fetch()[0].result;

      if (result) return Games.find().fetch()[0].result;
      else return null;
    }
  });

  Template.player.events({
    'click .move1': function () {
      // update a player's move
      Meteor.call('updateGame', 1, Number(event.target.value));

      // determine the winner
      Meteor.call('determineWinner');
    },
    'click .move2': function () {
      // // update a player's move
      Meteor.call('updateGame', 2, Number(event.target.value));

      // determine the winner
      Meteor.call('determineWinner');
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    return Meteor.methods({
      removeAllGames: function () {
        return Games.remove({});
      },
      initializeGame: function () {
        if (Games.find().fetch().length < 1) {
          Games.insert({
            player1: null,
            player2: null,
            result: null
          });
        }
      },
      updateGame: function (player, move) {
        var update = {};

        if (player === 1) update.player1 = move;
        else if (player === 2) update.player2 = move;

        Games.update({}, {
          $set: update
        });

        return;
      },
      determineWinner: function () {
        var gameResult;
        var move1 = Games.find().fetch()[0].player1;
        var move2 = Games.find().fetch()[0].player2;

        if (move1 && move2) {
          var winner = (3 + move1 - move2) % 3;

          if (winner === 0) gameResult = 'Tie!';
          else if (winner === 1) gameResult = 'Player 1 is the winner!';
          else if (winner === 2) gameResult = 'Player 2 is the winner!';

          Games.update({}, {
            $set: {
              player1: null,
              player2: null,
              result: gameResult
            }
          });
        }

        return;
      }
    });
  });
}
