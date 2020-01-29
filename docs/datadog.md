# **DATADOG Reporting Configuration**

## **Creating A Dashboard**
DATADOG makes it easy to create a Dashboard:
* Click on Dashboards, then select "New Dashboard" from the left menu
* Give the Dashboard a name and select "New Timeboard"
[<img src="../images/DataDogCreatingDashboard2.png" width="50%">](./images/DataDogCreatingDashboard2.png)
* Click on "Add a graph"
* Drag the "Timeseries" widget to the rectangular area below
[<img src="../images/DataDogCreatingDashboard3.png" width="50%">](./images/DataDogCreatingDashboard3.png)
* Click on the JSON editor and paste below content:
  ```json
  {
    "viz": "timeseries",
    "requests": [
      {
        "q": "sum:utterance.success{*}.as_count()",
        "type": "bars",
        "style": {
          "palette": "cool",
          "type": "solid",
          "width": "normal"
        },
        "aggregator": "avg",
        "conditional_formats": []
      },
      {
        "q": "sum:utterance.failure{*}.as_count()",
        "type": "bars",
        "style": {
          "palette": "warm",
          "type": "solid",
          "width": "normal"
        }
      }
    ],
    "autoscale": true
  }
  ```
* Give your graphic a title and click on the "Done" button

## Creating A Table With Success, Failure And Percentage, Grouped by Some Attribute
```json
{
    "viz": "query_table",
    "requests": [
        {
            "q": "sum:utterance.success{customer:customerName} by {utterance}",
            "conditional_formats": [],
            "alias": "Success",
            "aggregator": "sum",
            "limit": 100,
            "order": "desc"
        },
        {
            "q": "sum:utterance.failure{customer:customerName} by {utterance}",
            "conditional_formats": [],
            "alias": "Failure",
            "aggregator": "sum"
        },
        {
            "q": "sum:utterance.success{customer:customerName} by {utterance}/(sum:utterance.failure{customer:customerName} by {utterance}+sum:utterance.failure{customer:customerName} by {utterance})*100",
            "conditional_formats": [
                {
                    "comparator": ">=",
                    "value": "90",
                    "palette": "white_on_green"
                },
                {
                    "comparator": "<",
                    "value": "70",
                    "palette": "white_on_red"
                },
                {
                    "comparator": "<",
                    "value": "90",
                    "palette": "white_on_yellow"
                }
            ],
            "alias": "% Success",
            "aggregator": "avg"
        }
    ]
}
```

TODO - Add a screenshot of the above

## **Creating Alarms**
DATADOG makes it easy to setup alarms, let's see how:
* Go to Monitors on the left menu and select "New Monitor"
[<img src="../images/DataDogCreatingAlarm1.png" width="50%">](./images/DataDogCreatingAlarm1.png)
* Select **Import** as the "monitor type"
[<img src="../images/DataDogCreatingAlarm2.png" width="50%">](./images/DataDogCreatingAlarm2.png)
* Paste below content in the monitor definition area:
  ```json
  {
    "name": "Long audio test failed",
    "type": "metric alert",
    "query": "sum(last_1h):sum:utterance.failure{*}.as_count() >= 1",
    "message": "Please review test results and take action. @all",
    "tags": [],
    "options": {
      "notify_audit": true,
      "locked": false,
      "timeout_h": 0,
      "new_host_delay": 300,
      "require_full_window": false,
      "notify_no_data": false,
      "renotify_interval": "0",
      "escalation_message": "",
      "no_data_timeframe": null,
      "include_tags": true,
      "thresholds": {
        "critical": 1
      }
    }
  }
  ```
* Click on the "Save" button