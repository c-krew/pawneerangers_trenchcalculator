from tethys_sdk.base import TethysAppBase, url_map_maker


class TrenchCalculator(TethysAppBase):
    """
    Tethys app class for Trench Calculator.
    """

    name = 'Trench Calculator'
    index = 'pawneerangers_trenchcalculator:home'
    icon = 'pawneerangers_trenchcalculator/images/icon.gif'
    package = 'pawneerangers_trenchcalculator'
    root_url = 'pawneerangers-trenchcalculator'
    color = '#2c3e50'
    description = 'Calculates import and export quantities for pipe installation trenches.'
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
                name='home',
                url='pawneerangers-trenchcalculator',
                controller='pawneerangers_trenchcalculator.controllers.home'
            ),
            UrlMap(
                name='map_view',
                url='pawneerangers-trenchcalculator/map_view',
                controller='pawneerangers_trenchcalculator.controllers.map_view'
            ),
            UrlMap(
                name='data_services',
                url='pawneerangers-trenchcalculator/data_services',
                controller='pawneerangers_trenchcalculator.controllers.data_services'
            ),
            UrlMap(
                name='about',
                url='pawneerangers-trenchcalculator/about',
                controller='pawneerangers_trenchcalculator.controllers.about'
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
