let id_counter = 0;

function gen_row_html(id) {
    let htmlstr = `<div class="tableCell">\
        <input type="text" name="${id}_name">\
    </div>\
    <div class="tableCell">\
        <select name="${id}_type">\
            <option value="int">Int</option>\
            <option value="float">Float</option>\
            <option value="str">String</option>\
            <option value="bool">Bool</option>\
        </select>\
    </div>\
    <div class="tableCell">\
        <input type="radio" name="main_key" value="${id}" onclick="select_main_key(${id})">\
    </div>\
    <div class="tableCell">\
        <input type="checkbox" name="is_nullable" value="${id}">\
    </div>\
    <div class="tableCell">\
        <input type="checkbox" name="is_unique" value="${id}">\
    </div>\
    <div class="tableCell">\
        <input type="checkbox" name="is_key" value="${id}">\
    </div>\
    <div class="tableCell">\
        <i class="gg-remove" onclick="remove_attribute(${id})"></i>\
    </div>`;
    return htmlstr;
}

function add_attribute() {
    id_counter++;
    let newRow = document.createElement('div')
    newRow.classList += 'tableRow'
    newRow.id = "attribute_tmp_" + id_counter;
    newRow.innerHTML = gen_row_html(id_counter);
    // alert(gen_row_html(id_counter));

    inputPanel = document.querySelector('#input_panel');
    inputPanel.appendChild(newRow)
}

function remove_attribute(id) {
    row = document.querySelector('#attribute_tmp_'+id);
    row.parentNode.removeChild(row);
}

function select_main_key(id){    
    row = document.querySelector('#attribute_tmp_'+id);
}