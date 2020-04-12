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
