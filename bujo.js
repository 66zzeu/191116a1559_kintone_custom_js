function array_each(obj, func) {
    if('number' == typeof obj)
        for(var index = 0; index < obj; ++index) { var result = func(index); if(result) return result; }
    else if(undefined !== obj.length)
        for(var index2 = 0; index2 < obj.length; ++index2) {
            var result2 = func(obj[index2], index2); if(result2) return result2;
        }
    else
        for(var name in obj) { var result3 = func(obj[name], name); if(result3) return result3; }
}

function kintone_api(url_part, method, params, succcess_callback) {
    kintone.api(kintone.api.url(url_part), method, params, succcess_callback,
        function(responce) {
            console.log('Error: ' + url_part);
            console.log(params);
            if (responce.message !== undefined) {
                console.log(resp.message);
            }
        }
    );
}

function on_show(event) {
    var actions_app_id = kintone.app.getRelatedRecordsTargetAppId('actions');
    // stayやinfo以外を取得し、
    var query = 'state not in ("stay", "info")'
    var params = {
        'app': actions_app_id,
        'query': query
    }
    kintone_api('/k/v1/records', 'GET', params, function(responce) {
        var update_records = []
        // 取得できたレコード群に対して、
        array_each(responce['records'], function(record) {
            // 学びを含まないなら無視
            if(record['tag']['value'].indexOf('学び') < 0) {
                return;
            }
            // 学びを含むならstayにする。
            update_records.push(
                {
                    'id': record['$id']['value'],
                    'record': {
                        'state': {'value': 'stay'}
                    },
                    'revision': record['$revision']['value'],
                }
            );
        })
        if(0 < update_records.length)
        {
            params = {
                'app': actions_app_id,
                'records': update_records,
            }
            kintone_api('/k/v1/records', 'PUT', params, function(response) {
                console.log('actions updated.');
                console.log(response);
            })
        }
        return event;
    });
}

// レコード詳細画面が表示されたら
kintone.events.on('app.record.detail.show', on_show);
kintone.events.on('mobile.app.record.detail.show', on_show);
