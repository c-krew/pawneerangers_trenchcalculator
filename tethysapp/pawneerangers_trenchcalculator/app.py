from tethys_sdk.base import TethysAppBase, url_map_maker


class TrenchCalculator(TethysAppBase):
    """
    Tethys app class for Trench Calculator.
    """

    name = 'PR Trench Calculator'
    index = 'pawneerangers_trenchcalculator:map_view_split'
    icon = 'pawneerangers_trenchcalculator/images/pr.JPG'
    package = 'pawneerangers_trenchcalculator'
    root_url = 'pawneerangers-trenchcalculator'
    color = '#2c3e50'
    description = 'Calculates import and export quantities for pipe installation trenches. Created by the Pawnee Rangers, "Be a Man."'
    tags = 'Construction'
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='map_view_split',
                url='pawneerangers-trenchcalculator/map_view_split',
                controller='pawneerangers_trenchcalculator.controllers.map_view_split'
            ),
            UrlMap(
                name='data_services',
                url='pawneerangers-trenchcalculator/data_services',
                controller='pawneerangers_trenchcalculator.controllers.data_services'
            ),
            UrlMap(
                name='proposal',
                url='pawneerangers-trenchcalculator/proposal',
                controller='pawneerangers_trenchcalculator.controllers.proposal'
            ),
            UrlMap(
                name='mockups',
                url='pawneerangers-trenchcalculator/mockups',
                controller='pawneerangers_trenchcalculator.controllers.mockups'
            )
        )

        return url_maps
