
// Resize Window
$(window).resize(function () {

    try {

        let chatheight = $(window).height();
        let cssText = '';
        let chatboxsizes = {
            top_chat: Number($('#nav_top')[0].offsetHeight + 32)
        };

        // Top Bar Size
        chatheight -= chatboxsizes.top_chat;

        // Debug Box
        cssText += `#debug, #app_base { height: ${chatheight}px !important; }`;

        $("#cssBasePage").text(cssText);

    } catch (err) {
        $("#cssBasePage").text('');
    }

});

const discord_manager = {

    scroll: {

        global1: function (item, item2) {

            const messages = $(item)[0];
            const shouldScroll = Math.ceil(messages.scrollTop + messages.clientHeight) >= messages.scrollHeight;

            if ($(item2).length > 100) {
                $(item2)
                    .eq(0)
                    .remove();
            }

            return shouldScroll;

        },

        global2: function (scrollposition, noScroll, item) {

            if (scrollposition && !noScroll) {
                $(item).scrollTop($(item)[0].scrollHeight);
            }

        },

        action: function (item, item2, newItem) {

            const scrollposition = discord_manager.scroll.global1(item, item2);

            $(item).append(newItem);

            discord_manager.scroll.global2(scrollposition, false, item);

        }

    },

    pagination: {
        format: "[ < nnncnnn > ]",
        onFormat: function (type) {

            switch (type) {

                case 'block':

                    if (!this.active)
                        return '<li class="page-item disabled"><a class="page-link" href="#">' + this.value + '</a></li>';
                    else if (this.value != this.page)
                        return '<li class="page-item"><a class="page-link" href="#' + this.value + '">' + this.value + '</a></li>';
                    return '<li class="page-item active"><a class="page-link" href="#">' + this.value + '<span class="sr-only">(current)</span></a></li>';

                case 'next':

                    if (this.active)
                        return '<li class="page-item"><a class="page-link" href="#' + this.value + '" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>';
                    return '<li class="page-item disabled"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>';

                case 'prev':

                    if (this.active)
                        return '<li class="page-item"><a class="page-link" href="#' + this.value + '" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li>';
                    return '<li class="page-item disabled"><a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li>';

                case 'first':

                    if (this.active)
                        return '<li class="page-item"><a class="page-link" href="#' + this.value + '" tabindex="-1">First</a></li>';
                    return '<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">First</a></li>';

                case 'last':

                    if (this.active)
                        return '<li class="page-item"><a class="page-link" href="#' + this.value + '" tabindex="-1">Last</a></li>';
                    return '<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">Last</a></li>';

                case "leap":

                    if (this.active)
                        return "   ";
                    return "";

                case 'fill':

                    if (this.active)
                        return "...";
                    return "";
            }
        }
    }

};

// Start System
const startSystem = function () {

    // Load
    $.LoadingOverlay("show", { background: "rgba(0,0,0, 0.5)" });

    // Start App
    $("#app").fadeOut(500, function () {

        $(this).empty().removeClass('centerDiv').addClass('container').append(

            // Navbar
            $("<nav>", { class: "navbar navbar-expand-lg navbar-light bg-light", id: "nav_top" }).append(

                // Buttons
                $("<a>", { class: "navbar-brand", href: "#", id: "bot_name" }).text("Debug Discord.JS"),
                $("<button>", { class: "navbar-toggler", type: "button", 'data-toggle': "collapse", 'data-target': "#navbarSupportedContent", 'aria-controls': "navbarSupportedContent", 'aria-expanded': false }).append(
                    $("<span>", { class: "navbar-toggler-icon" })
                ),

                // Menu
                $("<div>", { class: "collapse navbar-collapse", id: "navbarSupportedContent" }).append(

                    // Left
                    $("<ul>", { class: "navbar-nav mr-auto mt-2 mt-lg-0" }).append(

                        // Server List
                        $("<li>", { class: "nav-item" }).append(
                            $("<a>", { class: "nav-link", href: "#" }).text('Server List')
                        ).click(function () {
                            $("#app_base").removeClass('d-none');
                            $("#debug").addClass('d-none');
                            discord_manager.server_list(1);
                        }),

                        // Debug List
                        $("<li>", { class: "nav-item" }).append(
                            $("<a>", { class: "nav-link", href: "#" }).text('Debug').click(function () {
                                $("#app_base").addClass('d-none');
                                $("#debug").removeClass('d-none');
                            }),
                        )

                    ),

                    // Right
                    $("<ul>", { class: "nav navbar-nav navbar-right ml-3" }).append(

                        // Patreon
                        $("<li>", { class: "nav-item" }).append(
                            $("<a>", { class: "btn btn-info", target: "_blank", href: "https://www.patreon.com/JasminDreasond" }).append(
                                $("<i>", { class: "fab fa-patreon" }), ' Patreon'
                            )
                        )

                    )

                )

            ),

            $("<div>", { id: "app_base", class: "d-none" }),

            $("<div>", { id: "debug" }).css('height', 0)

        );

        $(this).fadeIn(500);

        // Resize
        $(window).trigger('resize');

    });


    discord_manager.bot = new Discord.Client({ autoReconnect: true });

    // Ready
    discord_manager.bot.on('ready', (event) => {

        console.log(`Discord Logged in as ${discord_manager.bot.user.tag}!`);

        $("#bot_name").text(discord_manager.bot.user.tag);

        // Resize
        $(window).trigger('resize');

    });

    // Reconnect
    discord_manager.bot.on('disconnect', (erMsg, code) => {
        console.error(`${erMsg}! Code: ${code}`);
    });

    // Error

    discord_manager.bot.on('error', (erMsg) => {
        console.error(erMsg);
    });

    // Warn
    discord_manager.bot.on('warn', (erMsg) => {
        console.warn(erMsg);
    });

    // Raw
    if (!$("#disable_debug").is(':checked')) {
        discord_manager.bot.on('raw', packet => {

            // Resize
            $(window).trigger('resize');

            const jsonViewer = new JSONViewer();
            const newRaw = $("<div>").append(jsonViewer.getContainer());
            jsonViewer.showJSON(packet, -1, 1);

            discord_manager.scroll.action('#debug', '#debug > div', newRaw);

        });
    }

    // Save Login
    if (typeof (Storage) !== "undefined") {
        if ($("#remember_token").is(":checked")) {
            localStorage.setItem("discord_token", $("#discord_token").val());
        } else {
            localStorage.removeItem("discord_token");
        }
    }

    // Login
    discord_manager.bot.login($("#discord_token").val()).then(function () {

        $.LoadingOverlay("hide");

        // Resize
        $(window).trigger('resize');

    }).catch(function (err) {

        $.LoadingOverlay("hide");
        $("#app").empty();
        alert(err.message);

        // Resize
        $(window).trigger('resize');

    });

};

// Start
jQuery(function () {

    // Set Login
    $("#start_discord").click(startSystem);
    $("#discord_token").on('keydown', function (ev) {
        if (ev.key === 'Enter') {

            startSystem();

            // Avoid form submit
            return false;
        }
    });

    // Get Storage
    if (typeof (Storage) !== "undefined") {

        const login_token = localStorage.getItem("discord_token");
        if (login_token) {
            $("#remember_token").prop('checked', true);
            $("#discord_token").val(login_token);
        }

    }

});