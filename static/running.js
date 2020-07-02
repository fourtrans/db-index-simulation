let result_list = []
let index_num_list = []

function update_content_message(new_message) {
    _iframe = $('#iframe_result_content')[0].contentWindow;
    message = _iframe.document.getElementById('message');
    message.textContent = new_message;
}

function update_content_data(data) {
    _iframe = $('#iframe_result_content')[0].contentWindow;
    tab = _iframe.document.getElementById('data');
    if (data === undefined || data.length === 1 && data[0].length === 0) {
        tab.innerHTML = ''
        return tab;
    }
    tab.innerHTML = ''
    for (i = 0; i < data.length; i++) {
        row = document.createElement('tr')
        for (j = 0; j < data[i].length; j++) {
            cell = document.createElement('td')
            cell.textContent = data[i][j].toString();
            row.appendChild(cell)
        }
        tab.appendChild(row)
    }
    return tab;
}

function insert_new_state(serial_number, is_success, sql_expr, msg) {
    _iframe = $('#iframe_result_state')[0].contentWindow;
    tab = _iframe.document.getElementById('data');

    num_cell = document.createElement('td')
    num_cell.textContent = serial_number.toString();

    flag_cell = document.createElement('td');
    flag_p = document.createElement('p');
    if (is_success) {
        flag_p.classList = 'gg-check-r';
    } else {
        flag_p.classList = 'gg-close-r';
    }
    flag_cell.appendChild(flag_p);

    expr_cell = document.createElement('td');
    expr_p = document.createElement('p');
    if (sql_expr.length > 20) {
        expr_p.textContent = sql_expr.slice(0, 40) + '...';
    } else {
        expr_p.textContent = sql_expr;
    }
    expr_cell.appendChild(expr_p);

    msg_cell = document.createElement('td');
    msg_p = document.createElement('p');
    msg_p.textContent = msg;
    msg_cell.appendChild(msg_p);

    row = document.createElement('tr');
    row.appendChild(num_cell);
    row.appendChild(flag_cell);
    row.appendChild(expr_cell);
    row.appendChild(msg_cell);

    // console.log(row);

    tab.appendChild(row);
}

function reload_bplus_tree_image(index_num) {
    img = $('#tabs-' + index_num + '>img')[0];
    path = '/image/' + index_num + '?' + Math.floor(Math.random() * 100000000);
    // console.log(index_num);
    img.src = path;
}

function execute_one_sql_and_update_state(sql_expr) {
    var result
    var resp = $.ajax('/api/sql/' + sql_expr, { dataType: 'json' }).done(function (data) {
        result = JSON.parse(resp.responseText);
        if (result.is_success) {
            insert_new_state(result.serial_number, result.is_success, result.sql_expr, result.error_msg);
        } else {
            insert_new_state(result.serial_number, result.is_success, result.sql_expr, result.error_msg);
        }
        result_list.push(result)
    }).fail(function () {
        insert_new_state('X', false, "/", "通信异常");
        result_list.push(result)
    })
}

function update_view(result) {
    console.log(result)
    if (result.is_success) {
        update_content_message("");
        update_content_data(result.content);

        // update image
        for (var i = 0; i < index_num_list.length; i++)
            reload_bplus_tree_image(index_num_list[i]);

    } else {
        update_content_message(result.error_msg);
        update_content_data([[]]);
    }
}

function freeze_input() {
    $('#sql_text_input')[0].disabled = true;
    $('#query_button')[0].disabled = true;
}

function unfreeze_input() {
    $('#sql_text_input')[0].disabled = false;
    $('#query_button')[0].disabled = false;
}


function start_query() {
    last_result = result_list[result_list.length - 1];
    if (last_result !== undefined) {
        update_view(last_result);
    }

    text = $('#sql_text_input')[0];
    mulit_sql = text.value;

    freeze_input();
    mulit_sql = mulit_sql.replace('\n', ' ');
    sql_list = mulit_sql.split(';')
    for (var i = 0; i < sql_list.length; i++) {
        sql_list[i] = sql_list[i].trim();
    }
    for (var i = 0; i < sql_list.length; i++) {
        sql = sql_list[i];
        if (sql !== '') {
            execute_one_sql_and_update_state(sql);
            console.log(sql)
        }
    }

    unfreeze_input();
    text.value = '';
    setTimeout(function () {
        last_result = result_list[result_list.length - 1];
        if (last_result !== undefined) {
            update_view(last_result);
        }
    }, 1000);
}


function initWebApp() {
    $("#tabs").tabs();

    tmp_tabs = $('#tabs div');
    tmp_tabs = tmp_tabs.slice(1);
    for (var i = 0; i < tmp_tabs.length; i++) {
        index_num_list.push(parseInt(tmp_tabs[i].id.slice(5)))
    }
}

initWebApp();