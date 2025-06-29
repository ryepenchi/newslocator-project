"""Application routes."""

from os import environ
from flask import current_app as app
from flask import render_template, jsonify, request
from datetime import datetime
from dateutil import parser as dp
from .models import db, Article, Place


@app.route('/')
def index():
    return render_template('index.html', mapboxtoken=environ.get('MAPBOX_TOKEN'))

@app.route('/points')
def points():
    # defaults to today
    now = datetime.now()
    todays_start = datetime(now.year, now.month, now.day, 0, 0, 0)
    todays_end = datetime(now.year, now.month, now.day, 23, 59, 59)
    from_date = request.args.get("from_date", todays_start)
    print("Received from_date: ", from_date)
    from_date = dp.parse(from_date, dayfirst=True)
    to_date = request.args.get("to_date", todays_end)
    print("Received to_date: ", to_date)
    to_date = dp.parse(to_date, dayfirst=True)
    print("Parsed dates: ", from_date, to_date)
    print("Querying from ", db.engine)
    points = Place.query.join(Place.articles).filter(from_date <= Article.pub_date, Article.pub_date <= to_date, Article.places != None).all()
    articles = Article.query.filter(from_date <= Article.pub_date, Article.pub_date <= to_date, Article.places != None).all()
    print("Found {} places and {} articles".format(len(points), len(articles)))
    p = []
    for point in points:
        links = [a.link for a in point.articles]
        aids = [a.id for a in point.articles]
        p.append({
            "word":point.word, 
            "links":links, 
            "aids": aids,
            "lat":point.lat, 
            "lon":point.lon,
            })
    a = dict()
    for article in articles:
        words = ", ".join([p.word for p in article.places])
        a[article.id] = {
            "id": article.id,
            "title":article.title, 
            "words":words, 
            "link":article.link,
            "pubdate":article.pub_date.strftime("%a, %d %b %Y"),
            "points": [{
                "word":point.word, 
                "links":[{"link":a.link, "title":a.title} for a in point.articles], 
                "lat":point.lat, 
                "lon":point.lon} for point in article.places]
            }
    return jsonify({"points": p, "articles": a})

# if __name__ == '__main__':
#     if len(sys.argv) > 1:
#         if sys.argv[1] == 'mkdb':
#             db.create_all()
#     else:
#         app.run(host="0.0.0.0", debug=False)
