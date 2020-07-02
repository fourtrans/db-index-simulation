from typing import Dict, List, Tuple
import re
import json

from flask import Flask, render_template, request, redirect, url_for, Response

import bin.core_agent as db
import nogit_data as DAT

app = Flask(__name__)


def resolve_form(form) -> Tuple[bool, dict]:
    def is_valid_name(name_str: str) -> bool:
        m = re.match('[a-zA-Z][a-zA-Z0-9_]*', name_str)
        return (m is not None)

    form_dict = form.to_dict()
    tmpIndex2realIndex: Dict[int, int] = {}

    # find all real index
    realIndexCounter = 0
    for key in form_dict:
        m = re.match('(\d+)_name', key)
        if m is None:
            continue
        tmp_index = int(m.group(1))
        tmpIndex2realIndex[tmp_index] = realIndexCounter
        realIndexCounter += 1

    # init definition
    table_definition = {}
    for realIndex in tmpIndex2realIndex.values():
        table_definition[realIndex] = {
            'name': '',
            'type': 'int',
            'is_nullable': False,
            'is_unique': False,
            'is_key': False
        }

    # configure name
    for tmpIndex in tmpIndex2realIndex:
        realIndex = tmpIndex2realIndex[tmpIndex]
        nameStr = form_dict[str(tmpIndex) + '_name']
        if not is_valid_name(nameStr):
            return False, {}
        table_definition[realIndex]['name'] = nameStr

    # add type
    for tmpIndex in tmpIndex2realIndex:
        realIndex = tmpIndex2realIndex[tmpIndex]
        typeStr = form_dict[str(tmpIndex) + '_type']
        table_definition[realIndex]['type'] = typeStr

    # add is_nullable, is_unique, is_key
    for tmpIndex in form.getlist('is_unique'):
        realIndex = tmpIndex2realIndex[int(tmpIndex)]
        table_definition[realIndex]['is_unique'] = True

    for tmpIndex in form.getlist('is_nullable'):
        realIndex = tmpIndex2realIndex[int(tmpIndex)]
        table_definition[realIndex]['is_nullable'] = True

    for tmpIndex in form.getlist('is_key'):
        realIndex = tmpIndex2realIndex[int(tmpIndex)]
        table_definition[realIndex]['is_key'] = True

    return True, table_definition


form_error_flag = False


@app.route('/')
@app.route('/index')
def index():
    global form_error_flag
    if form_error_flag:
        form_error_flag = False
        return render_template(r'table_builder.html', errorless=False,
                               error_msg='属性名应当以字母开头，后续以字母、数字、下划线组成！')
    else:
        return render_template(r'table_builder.html', errorless=True, error_msg='')


@app.route('/run')
def push_webapp():
    if db.is_init() == False:
        return redirect(url_for('index'))
    else:
        tabdef = db.get_current_definition()
        index_num_list = [i for i in range(len(tabdef)) if tabdef[i]['is_key'] == True]
        return render_template('running.html', table_definition=zip(tabdef.keys(), tabdef.values()),
                               index_num_list=index_num_list)


@app.route('/form', methods=['POST'])
def receive_form():
    is_formed, table_definition = resolve_form(request.form)
    if is_formed:
        db.reset_and_init(table_definition)
        return redirect(url_for('push_webapp'))
    else:
        global form_error_flag
        form_error_flag = True
        return redirect(url_for('index'))


@app.route('/test/1')
def test_page():
    tabdef = db.get_current_definition()
    return render_template(r'running.html', table_definition=zip(tabdef.keys(), tabdef.values()))


@app.route("/image/<imageid>")
def get_bplustree_image(imageid):
    indexId = re.match('(\d+).*', imageid).group(1)
    db.gen_bplustree_picture('./tmp_file/BPlusTree/index' + indexId, int(indexId))
    with open('./tmp_file/BPlusTree/index' + indexId + '.png', 'rb') as file:
        image = file.read()
        resp = Response(image, mimetype="image/png")
        return resp


@app.route('/api/sql/<sql_expr>')
def execute_one_sql(sql_expr):
    result = db.execute_one_sql(sql_expr)
    return json.dumps(result)


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500


@app.errorhandler(404)
def internal_server_error(e):
    return render_template('404.html'), 500


# initializing server ...
if __name__ == '__main__':
    app.run(debug=True)
