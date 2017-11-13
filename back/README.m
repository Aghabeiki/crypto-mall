app structure

* rest api service
    - design based Sails.js
    - implemented by Express 4
    - this app dose not any DB connection or other hock ( not added for speed it up)
* hotel classification logic
    - the logic is under /controller/roomHotelNameLogic
    - the main point is Classifier class
    - used in HotelNameClassifier controller


* app configuration :
    - env, located under env folder
        - basePath : used for set a base path for the prefix of the RestAPI URL
    - config, located under config folder
        - Services :  used for enable and disable the available services .
    - service: located under the service folder
        - this is a middleware part for express
        * API Checker : used for checking API key
        * PreRouteConfig: used for define different base path in different environment ( use basePath config in env )



* end points :
    - POST '/pointing': -> use for classifier data
        - params:
          header:
           api-key:
            type: string
            default value ( hardcoded in config: 'test' )
          body:
            type: object
            items:
                failed:
                    type: array
                rawRooms:
                    type: array
            sample -> sampleInput/pointing.json

    - POST '/standardMyData': -> use for standardize input data
        -params:
            header:
            api-key:
               type: string
               default value ( hardcoded in config: 'test' )
           body:
           hotelID:
            type: string
            required: false
           availableRooms:
            type: array
           sample -> sampleInput/standardMyData


Pay Attention
* the API key is hard coded in  code as 'test'
* be careful about the amount of the room name that pass to system.



