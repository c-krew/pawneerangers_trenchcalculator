from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import *
import json

@login_required()
def home(request):
    """
    Controller for the app home page.
    """


    context = {
    }

    return render(request, 'pawneerangers_trenchcalculator/home.html', context)

@login_required()
def data_services(request):
    """
    Controller for the app home page.
    """


    context = {
    }

    return render(request, 'pawneerangers_trenchcalculator/data_services.html', context)

@login_required()
def proposal(request):
    """
    Controller for the app home page.
    """


    context = {
    }

    return render(request, 'pawneerangers_trenchcalculator/proposal.html', context)

@login_required()
def mockups(request):
    """
    Controller for the app home page.
    """


    context = {
    }

    return render(request, 'pawneerangers_trenchcalculator/mockups.html', context)


@login_required()
def map_view_split(request):
    """
    Controller for the app home page.
    """

    context = {
    }

    return render(request, 'pawneerangers_trenchcalculator/map_view_split.html', context)