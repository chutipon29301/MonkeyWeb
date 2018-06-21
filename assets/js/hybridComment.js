$(".list-group").on('click', 'li.list-group-item', function () {
    $('.list-group > .list-group-item').removeClass('active');
    $(this).addClass('active');
});