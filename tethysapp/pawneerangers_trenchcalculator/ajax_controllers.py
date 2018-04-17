import math
from django.http import JsonResponse, Http404, HttpResponse
from .app import TrenchCalculator as app
from django.views.decorators.csrf import csrf_exempt
from tethys_sdk.gizmos import *

@csrf_exempt
def plot_elevations(request):

    return_obj = {
        "success": False,
        "message": None,
        "results": {}
    }
    if not (request.is_ajax() and request.method == "POST"):
        return_obj["success"] = False
        return_obj["message"] = "Unable to communicate with server."
        return_obj["results"] = {}

        return JsonResponse(return_obj)

    elevation_points = request.POST.get("ptelev").split(",")
    trench_min_depth = float(request.POST.get("min_depth"))
    trench_slope = float(request.POST.get("base_slope"))
    trench_base_width = int(request.POST.get("base_width"))
    pipe_diameter = float(request.POST.get("pipe_diameter"))
    pipe_zone_depth = float(request.POST.get("back_depth"))
    side_slope = float(request.POST.get("side_slope"))
    initial_depths = []
    section_length = float(request.POST.get("section_length"))
    for i, elevation_point in enumerate(elevation_points):
        initial_depth = float(elevation_point) - ((trench_slope / 100) * i * section_length)
        initial_depths.append(initial_depth)
    elevation_intercept = min(initial_depths) - trench_min_depth

    section_volumes = []
    slope_conversion = (90 - side_slope) * (3.1415 / 180)
    for i, elevation_point in enumerate(elevation_points):
        trench_depth = float(elevation_point) - (((trench_slope / 100) * i * section_length) + elevation_intercept)
        section_volume = (trench_base_width * trench_depth * section_length) + (section_length * trench_depth ** 2 * math.tan(slope_conversion))
        section_volumes.append(section_volume)
    trench_volume = sum(section_volumes)
    pipe_volume = (3.1415 * (pipe_diameter / 2) ** 2) * section_length * len(elevation_points)
    trench_pipe_zone_volume = (((trench_base_width * pipe_zone_depth) + (pipe_zone_depth ** 2 * math.tan(slope_conversion))) * section_length * len(elevation_points))
    backfill_volume = trench_pipe_zone_volume - pipe_volume
    bedding_volume = trench_volume - trench_pipe_zone_volume
    plot_data = []
    for i, point in enumerate(elevation_points):
        plot_data.append([section_length * i, float(point)])

    return_obj["success"] = True
    return_obj["message"] = "Volumes calculated successfully"
    return_obj["results"] = {
                                "plot_data": plot_data,
                                "offhaul_volume": round(trench_volume/27),
                                "backfill_volume": round(backfill_volume/27),
                                "bedding_volume": round(bedding_volume/27)
                            }

    return JsonResponse(return_obj)
