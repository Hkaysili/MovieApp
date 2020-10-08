var movieApp = {
  apiKey: '39f1c08a',
  searchButton: $('.search-button'),
  searchInput: $('.search-input'),
  init: function() {
    this.bindEvents();
    this.refreshHistoryList();
    this.refreshFavoritesList();
  },
  bindEvents: function() {
    var $this = this;
    this.searchInput.on('keyup', function() {
      $this.validate();
    });

    this.searchButton.on('click', this.fetchResults.bind($this, null));

    $(document).on('click', '.history-item button', function() {
      var query = $(this).find('span').text();
      $this.searchInput.val(query);
      $this.fetchResults(query);
    });

    $(document).on('click', '.list-item a', function(e) {
      e.preventDefault();
    });

    $(document).on('click', '.toggle-favorite-button', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var item = $(this).closest('.list-item').attr('data-item');

      $(this).toggleClass('selected');
      $this.toggleFavorite(JSON.parse(decodeURIComponent(item)));
    });

    $(document).on('click', '.history-item .icon', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var query = $(this).closest('.history-item').find('span').text();
      $this.removeSearchQueryFromHistory(query);
    });
  },
  fetchResults: function(searchQuery) {
    var $this = this;
    var query = searchQuery || this.searchInput.val();
    
    var url = 'http://www.omdbapi.com/';
    url += '?apiKey=' + this.apiKey;
    url += '&s=' + query;

    if (!searchQuery) {
      this.addSearchQueryToHistory(query);
    }

    $('.page-section.results .list').empty();

    $.get(url, function(data) {
      $('.page-section.results').addClass('visible');

      if (data.Response === 'False') {
        $('.page-section.results .no-result-message').addClass('visible');
        $('.page-section.results .list').removeClass('visible');
        return;
      }

      $(data.Search).each(function(i, item) {
        console.log($this.getListItemTemplate(item));

        $('.page-section.results .list').append($this.getListItemTemplate(item));
      });

      $('.page-section.results .no-result-message').removeClass('visible');
      $('.page-section.results .list').addClass('visible');
    });
  },
  getListItemTemplate: function(item) {
    var $this = this;

    return '\
      <li class="list-item" data-item="' + encodeURIComponent(JSON.stringify(item)) + '">\
        <a href="#">\
          <div class="poster-wrapper">\
            <img src="' + item.Poster + '" class="poster" alt="' + item.Title + '">\
          </div>\
          <h3 class="name">' + item.Title + '</h3>\
          <span class="year">' + item.Year + '</span>\
          <i class="toggle-favorite-button ' + ($this.isItemAddedToFavorites(item) ? 'selected' : '') + ' far fa-heart"></i>\
        </a>\
      </li>\
      ';
  },
  isItemAddedToFavorites: function(item) {
    var isAdded = false;
    var favorites = JSON.parse(localStorage.favorites || '[]');

    $(favorites).each(function(i, movie) {
      if (item.imdbID == movie.imdbID) {
        isAdded = true;
        return false;
      }
    });

    return isAdded;
  },
  getHistoryItemTemplate: function(item) {
    return '\
      <li class="history-item">\
        <button>\
          <span>' + item + '</span>\
          <i class="icon fas fa-times-circle"></i>\
        </button>\
      </li>\
      ';
  },
  validate: function() {
    this.searchButton.prop('disabled', this.searchInput.val().length < 3);
  },
  addSearchQueryToHistory: function(query) {
    var history = JSON.parse(localStorage.history || '[]');

    if (history.indexOf(query) != -1) {
      history.splice(history.indexOf(query), 1);
    }

    history.unshift(query);
    history.slice(0, 10);

    localStorage.history = JSON.stringify(history);
    this.refreshHistoryList();
  },
  removeSearchQueryFromHistory: function(query) {
    var history = JSON.parse(localStorage.history || '[]');

    if (history.indexOf(query) != -1) {
      history.splice(history.indexOf(query), 1);
    }

    localStorage.history = JSON.stringify(history);
    this.refreshHistoryList();
  },
  refreshHistoryList: function() {
    var $this = this;
    var history = JSON.parse(localStorage.history || '[]');

    $('.history-list').empty();

    $(history).each(function(i, item) {
      $('.history-list').append($this.getHistoryItemTemplate(item));
    });
  },
  toggleFavorite: function(movie) {
    var movieFound = false;
    var favorites = JSON.parse(localStorage.favorites || '[]');

    $(favorites).each(function(i, item) {
      if (item.imdbID == movie.imdbID) {
        favorites.splice(i, 1);
        movieFound = true;
      }
    });

    if (!movieFound) {
      favorites.unshift(movie);
    }

    localStorage.favorites = JSON.stringify(favorites);
    this.refreshFavoritesList();
  },
  refreshFavoritesList: function() {
    var $this = this;
    var favorites = JSON.parse(localStorage.favorites || '[]');

    $('.page-section.favorites .list').empty();

    $(favorites).each(function(i, item) {
      $('.page-section.favorites .list').append($this.getListItemTemplate(item));
    });

    if ($('.page-section.favorites .list').children().length) {
      $('.page-section.favorites, .page-section.favorites .list').addClass('visible');
    }
  },
};

movieApp.init();