from django.http import JsonResponse, Http404, HttpResponse
from .app import TrenchCalculator as app
from tethys_sdk.gizmos import *

def plot_elevations(request):
    return_obj = {
        'success': True
    }

    # Check if its an ajax post request
    if request.is_ajax() and request.method == 'GET':

        data = request.GET.get('ptelev')
        print(data)
    #
    #     timeseries_plot = TimeSeries(
    #         height='500px',
    #         width='500px',
    #         engine='highcharts',
    #         title='Sabana Yequa',
    #         y_axis_title='Niveles de agua',
    #         y_axis_units='m',
    #         series=[{
    #             'name': 'Historico',
    #             'data': data
    #         }],
    #         y_min=300
    #     )
    # return_obj['timeseries_plot'] = timeseries_plot

    return JsonResponse(return_obj)
