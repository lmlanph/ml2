from flask import Flask, request, jsonify
import json
import psycopg2
import os
import requests
import devmail_ml2 as dm

# requires pip3 install python-dotenv--and creation of .env file (add to .gitignore)
psql_pass = os.getenv('PSQL_PASS')
ipinfo_token = os.getenv('IPINFO_TOKEN')


DEV = False


app = Flask(__name__)


script_data = '''
        SELECT
            id, image_url, image_description, comment_id, image_id, comment, votes, submitted_by
        FROM
            images
        LEFT JOIN image_comments
            ON id = image_id
        ORDER BY created_at;

        '''


def process_images(query):

    data = []

    for i in query:

        found = False

        # loop over data (if present), and check .items() for the key/value pair
        for d in data:
            # if the image id is present...
            if ('id', i[0]) in d.items():
                # just append the comment
                d["comments"].append({'comment_id': i[3], 'comment': i[5], 'votes': i[6], 'submitted_by': i[7]})
                d["votes"] += i[6]
                found = True
                break

        # if image not present, append new (dict) item
        # id, vote, comment, sub by
        if not found:
            tmpDict = {"id": i[0], "img": i[1], "comments": [{'comment_id': i[3], 'comment': i[5], 'submitted_by': i[7], 'upvoted': False}], "commentShown": False, "votes": i[6]}
            data.append(tmpDict)

    # calculate 'activity'
    for i in data:

        if i['votes']:
            i['activity'] = (len(i['comments']) + int(i['votes']))
        else:
            # note bug here, if downvote own comment, activity set to zero rather than 1
            i['activity'] = 0

    return data


@ app.route('/api/datatop')
def data_top():

    # works with finally clause below
    conn = None
    cur = None

    try:
        conn = psycopg2.connect(
            database='ml2',
            user='postgres',
            password=psql_pass
        )

        cur = conn.cursor()

        cur.execute(script_data)

        # list of tuples
        images = cur.fetchall()

        data = process_images(images)

        top_list = sorted(data, key=lambda x: x['activity'], reverse=True)

    except Exception as e:
        print(e)
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    return json.dumps(top_list[:4])


@ app.route('/api/data')
def data_all():
    '''
        TO DO: randomize order so different images appear near top of page each refresh


    transform list of tuples (from psql) to list of dict, with nested comments
    return json (array of objects)
    '''

    # works with finally clause below
    conn = None
    cur = None

    try:
        conn = psycopg2.connect(
            database='ml2',
            user='postgres',
            password=psql_pass
        )

        cur = conn.cursor()

        cur.execute(script_data)

        # list of tuples
        images = cur.fetchall()

        data = process_images(images)

    except Exception as e:
        print(e)
        print('something went wrong HERE')
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    return json.dumps(data)


@ app.route('/api/comment', methods=['POST'])
def add_comment():

    data = request.form  # a multidict containing POST data
    print(data['comment_id'])

    # works with finally clause below
    conn = None
    cur = None

    if not DEV:  # look up country by ip
        try:
            ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
            print(ip)
            r = requests.get(f'https://ipinfo.io/{ip}?token={ipinfo_token}')
            r_dict = r.json()
            country = r_dict['country']
        except Exception as e:
            print(e)
            country = 'US_Fail'
    else:
        country = 'US_Dev'

    try:
        conn = psycopg2.connect(
            database='ml2',
            user='postgres',
            password=psql_pass
        )

        cur = conn.cursor()

        script = '''
        INSERT INTO image_comments
        (comment_id, image_id, comment, votes, submitted_by)
        VALUES (%s, %s, %s, %s, %s)
        '''

        value = (data['comment_id'], data['img_id'], data['comment'], 1, country)

        cur.execute(script, value)

        conn.commit()

        message = f'ml2 comment: {data["comment"]}'
        dm.mailMe(message)

    except Exception as e:
        print(e)
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    # return jsonify({'ip': ip}), 200
    return 'blustery weather'


@ app.route('/api/vote', methods=['POST'])
def vote():

    # works with finally clause below
    conn = None
    cur = None

    json = request.json

    # print(json)
    # print(type(json['id']))
    print(json['vote'])

    try:
        conn = psycopg2.connect(
            database='ml2',
            user='postgres',
            password=psql_pass
        )

        cur = conn.cursor()

        if json['vote'] == "up":
            script_vote = '''
            UPDATE image_comments
            SET votes = votes + 1
            WHERE comment_id = %s;
            '''
        else:
            script_vote = '''
            UPDATE image_comments
            SET votes = votes - 1
            WHERE comment_id = %s;
            '''

        value = (json['id'],)

        cur.execute(script_vote, value)

        conn.commit()

    except Exception as e:
        print(e)
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    return('howdY!')


if __name__ == "__main__":
    app.run()
